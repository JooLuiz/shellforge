import { describe, expect, it } from "vitest";

import {
  buildAliasToActionMap,
  buildScheduledCommandString,
  composeScheduledTaskCommand,
  parseScheduledCommandDraft,
  parseScheduledCommandMetadataLine,
  serializeScheduledCommandMetadata,
  validateScheduledCommandDraft,
} from "./scheduledTaskCommand";
import type { CustomActionUiConfig } from "./types";

const customActions: Record<string, CustomActionUiConfig> = {
  performApiRequest: {
    availableOnCLI: true,
    aliases: ["perform-api-request", "notify"],
  },
};

describe("scheduledTaskCommand", () => {
  it("builds command strings with verbose flag and quoted args", () => {
    expect(
      buildScheduledCommandString({
        alias: "perform-api-request",
        verbose: true,
        actionArgs: {
          message: "Hello from schedule",
          taskId: "ABC-123",
        },
      }),
    ).toBe('perform-api-request -v --arg.message="Hello from schedule" --arg.taskId=ABC-123');
  });

  it("parses metadata line round-trip", () => {
    const metadata = {
      version: 1 as const,
      kind: "customActionAlias" as const,
      alias: "perform-api-request",
      actionName: "performApiRequest",
      verbose: true,
      actionArgs: { message: "Hi" },
    };

    const serialized = serializeScheduledCommandMetadata(metadata);
    expect(parseScheduledCommandMetadataLine(`${serialized}\n$TaskName = "Test"`)).toEqual(metadata);
  });

  it("hydrates draft from metadata and composes command", () => {
    const aliasMap = buildAliasToActionMap(customActions);
    const draft = parseScheduledCommandDraft(
      "",
      {
        version: 1,
        kind: "customActionAlias",
        alias: "perform-api-request",
        actionName: "performApiRequest",
        verbose: false,
        actionArgs: { message: "Scheduled" },
      },
      aliasMap,
    );

    expect(composeScheduledTaskCommand(draft)).toEqual({
      command: 'perform-api-request --arg.message=Scheduled',
      commandMetadata: {
        version: 1,
        kind: "customActionAlias",
        alias: "perform-api-request",
        actionName: "performApiRequest",
        actionArgs: { message: "Scheduled" },
      },
    });
  });

  it("validates required args for alias commands", () => {
    const validationError = validateScheduledCommandDraft(
      {
        kind: "customActionAlias",
        alias: "perform-api-request",
        actionName: "performApiRequest",
        verbose: false,
        actionArgs: {},
        customCommand: "",
      },
      { required: ["message"] },
    );

    expect(validationError).toContain("message");
  });

  it("composes custom commands with verbose flag and metadata", () => {
    expect(
      composeScheduledTaskCommand({
        kind: "custom",
        alias: "",
        actionName: null,
        verbose: true,
        actionArgs: {},
        customCommand: "reinitialize",
      }),
    ).toEqual({
      command: "reinitialize -v",
      commandMetadata: {
        version: 1,
        kind: "custom",
        verbose: true,
      },
    });
  });

  it("does not duplicate verbose flag on custom commands", () => {
    expect(
      composeScheduledTaskCommand({
        kind: "custom",
        alias: "",
        actionName: null,
        verbose: true,
        actionArgs: {},
        customCommand: "reinitialize -v",
      }),
    ).toEqual({
      command: "reinitialize -v",
      commandMetadata: {
        version: 1,
        kind: "custom",
        verbose: true,
      },
    });
  });

  it("hydrates custom command draft from metadata", () => {
    const aliasMap = buildAliasToActionMap(customActions);
    const draft = parseScheduledCommandDraft(
      "reinitialize -v",
      {
        version: 1,
        kind: "custom",
        verbose: true,
      },
      aliasMap,
    );

    expect(draft).toEqual({
      kind: "custom",
      alias: "",
      actionName: null,
      verbose: true,
      actionArgs: {},
      customCommand: "reinitialize -v",
    });
  });
});
