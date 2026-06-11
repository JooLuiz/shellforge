import { describe, expect, it } from "vitest";
import { ensureAppConfig } from "./defaults";
import { PREDEFINED_COMMAND_KEYS } from "./predefinedCommandsRegistry";

describe("ensureAppConfig", () => {
  // Scenario: legacy configs still using exposeInProfile should map to availableOnCLI.
  // Expected: normalization keeps the action available on CLI after migration.
  it("migrates exposeInProfile to availableOnCLI", () => {
    const normalizedConfig = ensureAppConfig({
      actionRunner: {
        "legacy-action": {
          steps: [],
        },
      },
      ui: {
        customActions: {
          "legacy-action": {
            exposeInProfile: true,
            aliases: ["legacy-action"],
          },
        },
      },
    });

    expect(normalizedConfig.ui.customActions["legacy-action"].availableOnCLI).toBe(true);
  });

  // Scenario: current configs already set availableOnCLI directly.
  // Expected: normalization preserves the explicit value.
  it("preserves availableOnCLI field from current configs", () => {
    const normalizedConfig = ensureAppConfig({
      actionRunner: {
        "modern-action": {
          steps: [],
        },
      },
      ui: {
        customActions: {
          "modern-action": {
            availableOnCLI: false,
            aliases: ["modern-action"],
          },
        },
      },
    });

    expect(normalizedConfig.ui.customActions["modern-action"].availableOnCLI).toBe(false);
  });

  // Scenario: configs without ui.predefinedCommands entries for new commands.
  // Expected: normalization creates all registry commands disabled by default.
  it("normalizes every predefined command as disabled by default", () => {
    const normalizedConfig = ensureAppConfig({
      actionRunner: {},
    });

    expect(Object.keys(normalizedConfig.ui.predefinedCommands)).toHaveLength(
      PREDEFINED_COMMAND_KEYS.length
    );
    PREDEFINED_COMMAND_KEYS.forEach((commandKey) => {
      expect(normalizedConfig.ui.predefinedCommands[commandKey].enabled).toBe(false);
      expect(normalizedConfig.ui.predefinedCommands[commandKey].alias).toBe(commandKey);
    });
  });
});
