import { describe, expect, it } from "vitest";

import {
  buildAliasToActionMap,
  buildScheduledCommandString,
  composeScheduledTaskCommand,
  createInitialActionArgs,
  getCommandInputValue,
  parseScheduledCommandDraft,
  parseScheduledCommandMetadataLine,
  resolveCustomActionFromAlias,
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

  it("returns an empty command string when alias is blank", () => {
    expect(
      buildScheduledCommandString({
        alias: "   ",
        verbose: false,
        actionArgs: {},
      }),
    ).toBe("");
  });

  it("resolves custom action aliases and ignores unavailable actions", () => {
    const actions: Record<string, CustomActionUiConfig> = {
      ...customActions,
      hiddenAction: {
        availableOnCLI: false,
        aliases: ["hidden"],
      },
    };

    expect(resolveCustomActionFromAlias("notify", actions)).toEqual({
      actionName: "performApiRequest",
      primaryAlias: "perform-api-request",
    });
    expect(resolveCustomActionFromAlias("hidden", actions)).toBeNull();
    expect(resolveCustomActionFromAlias("   ", actions)).toBeNull();
  });

  it("parses alias commands from raw command text when metadata is absent", () => {
    const aliasMap = buildAliasToActionMap(customActions);
    const draft = parseScheduledCommandDraft(
      "notify -v --arg.message=Hello",
      null,
      aliasMap,
    );

    expect(draft).toEqual({
      kind: "customActionAlias",
      alias: "perform-api-request",
      actionName: "performApiRequest",
      verbose: true,
      actionArgs: { message: "Hello" },
      customCommand: "notify -v --arg.message=Hello",
    });
  });

  it("parses unknown commands as custom drafts", () => {
    const aliasMap = buildAliasToActionMap(customActions);
    const draft = parseScheduledCommandDraft("git-root --verbose", null, aliasMap);

    expect(draft.kind).toBe("custom");
    expect(draft.customCommand).toBe("git-root --verbose");
    expect(draft.verbose).toBe(true);
  });

  it("returns command input values and initial action args", () => {
    expect(
      getCommandInputValue({
        kind: "customActionAlias",
        alias: "notify",
        actionName: "performApiRequest",
        verbose: false,
        actionArgs: {},
        customCommand: "",
      }),
    ).toBe("notify");

    expect(
      createInitialActionArgs({
        required: ["message"],
        optional: ["taskId"],
        defaults: { message: "Hello" },
      }),
    ).toEqual({
      message: "Hello",
      taskId: "",
    });
  });

  it("validates empty custom commands and rejects invalid metadata", () => {
    expect(
      validateScheduledCommandDraft(
        {
          kind: "custom",
          alias: "",
          actionName: null,
          verbose: false,
          actionArgs: {},
          customCommand: "   ",
        },
        null,
      ),
    ).toBe("Command cannot be empty.");

    expect(parseScheduledCommandMetadataLine("not metadata")).toBeNull();
    expect(
      parseScheduledCommandMetadataLine(
        '# shellforge:scheduledCommandV1 {"version":2,"kind":"custom"}',
      ),
    ).toBeNull();
    expect(
      parseScheduledCommandMetadataLine("# shellforge:scheduledCommandV1 {invalid-json"),
    ).toBeNull();
  });

  it("omits empty action args from metadata", () => {
    expect(
      composeScheduledTaskCommand({
        kind: "customActionAlias",
        alias: "perform-api-request",
        actionName: "performApiRequest",
        verbose: false,
        actionArgs: { message: "  " },
        customCommand: "",
      }).commandMetadata,
    ).toEqual({
      version: 1,
      kind: "customActionAlias",
      alias: "perform-api-request",
      actionName: "performApiRequest",
    });
  });

  it("validates alias drafts without required schema and empty aliases", () => {
    expect(
      validateScheduledCommandDraft(
        {
          kind: "customActionAlias",
          alias: "   ",
          actionName: null,
          verbose: false,
          actionArgs: {},
          customCommand: "",
        },
        null,
      ),
    ).toBe("Command cannot be empty.");

    expect(
      validateScheduledCommandDraft(
        {
          kind: "customActionAlias",
          alias: "perform-api-request",
          actionName: "performApiRequest",
          verbose: false,
          actionArgs: { message: "Hello" },
          customCommand: "",
        },
        null,
      ),
    ).toBeNull();
  });

  it("quotes argument values that contain spaces", () => {
    expect(
      buildScheduledCommandString({
        alias: "perform-api-request",
        verbose: false,
        actionArgs: { message: 'Say "hello"' },
      }),
    ).toBe('perform-api-request --arg.message="Say \\"hello\\""');
  });

  it("returns undefined metadata for empty custom drafts", () => {
    expect(
      composeScheduledTaskCommand({
        kind: "custom",
        alias: "",
        actionName: null,
        verbose: false,
        actionArgs: {},
        customCommand: "   ",
      }).commandMetadata,
    ).toBeUndefined();
  });

  it("parses flag-only CLI args and hydrates alias metadata without actionName", () => {
    const aliasMap = buildAliasToActionMap(customActions);
    const draft = parseScheduledCommandDraft(
      "perform-api-request --arg.force",
      null,
      aliasMap,
    );

    expect(draft.actionArgs).toEqual({ force: "true" });

    const metadataDraft = parseScheduledCommandDraft(
      "ignored command body",
      {
        version: 1,
        kind: "customActionAlias",
        alias: "perform-api-request",
        verbose: true,
      },
      aliasMap,
    );

    expect(metadataDraft.actionName).toBe("performApiRequest");
    expect(metadataDraft.verbose).toBe(true);
  });
});
