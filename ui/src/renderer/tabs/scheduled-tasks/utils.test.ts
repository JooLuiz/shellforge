import { describe, expect, it } from "vitest";
import type { AppConfig } from "../../../shared/types";
import {
  buildCliAvailableCommandOptions,
  normalizeCommandOptions,
  serializeTaskDraft,
} from "./utils";

describe("scheduled-tasks utils", () => {
  const customActions: AppConfig["ui"]["customActions"] = {
    "cli-action": {
      availableOnCLI: true,
      aliases: ["my-cli-command"],
    },
    "hidden-action": {
      availableOnCLI: false,
      aliases: ["hidden-command"],
    },
    "fallback-name-action": {
      availableOnCLI: true,
      aliases: [],
    },
  };

  it("includes only custom actions marked available on CLI", () => {
    expect(buildCliAvailableCommandOptions(customActions)).toEqual([
      "fallback-name-action",
      "my-cli-command",
    ]);
  });

  it("uses the primary alias with action-name fallback", () => {
    const options = buildCliAvailableCommandOptions({
      "named-action": {
        availableOnCLI: true,
        aliases: ["primary-alias"],
      },
    });

    expect(options).toEqual(["primary-alias"]);
  });

  it("dedupes and sorts command options", () => {
    expect(normalizeCommandOptions([" beta ", "alpha", "beta", ""])).toEqual([
      "alpha",
      "beta",
    ]);
  });

  it("serializes task drafts with sorted trigger times", () => {
    const serializedDraft = serializeTaskDraft({
      actionName: "Morning Task",
      triggerTimes: ["12:00", "08:30"],
      weekdays: ["Monday"],
      command: "my-command",
    });

    expect(JSON.parse(serializedDraft)).toEqual({
      actionName: "Morning Task",
      triggerTimes: ["08:30", "12:00"],
      weekdays: ["Monday"],
      command: "my-command",
      commandMetadata: null,
    });
  });
});
