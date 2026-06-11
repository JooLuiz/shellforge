import { describe, expect, it } from "vitest";
import {
  buildPredefinedCommandExecutablePaths,
  getPredefinedCommandBatPath,
  PREDEFINED_COMMAND_DEFINITIONS,
  PREDEFINED_COMMAND_KEYS,
} from "./predefinedCommandsRegistry";

describe("predefinedCommandsRegistry", () => {
  // Scenario: registry drives profile/UI ordering for predefined commands.
  // Expected: action-runner remains the first canonical command key.
  it("keeps action-runner as the first predefined command", () => {
    expect(PREDEFINED_COMMAND_KEYS[0]).toBe("action-runner");
    expect(PREDEFINED_COMMAND_DEFINITIONS[0]?.key).toBe("action-runner");
  });

  // Scenario: repo path resolution for predefined command launchers.
  // Expected: each command resolves to <repo>/<folder>/<key>.bat.
  it("builds bat paths for every predefined command", () => {
    const executablePaths = buildPredefinedCommandExecutablePaths("C:\\repo\\shellforge");

    expect(executablePaths["action-runner"]).toBe(
      "C:\\repo\\shellforge\\commands\\action-runner\\action-runner.bat"
    );
    expect(executablePaths.touch).toBe("C:\\repo\\shellforge\\commands\\touch\\touch.bat");
    expect(executablePaths["git-root"]).toBe(
      "C:\\repo\\shellforge\\commands\\git-root\\git-root.bat"
    );
    expect(Object.keys(executablePaths)).toHaveLength(PREDEFINED_COMMAND_KEYS.length);
  });

  it("does not include sleep in predefined commands", () => {
    expect(PREDEFINED_COMMAND_KEYS).not.toContain("sleep");
  });

  // Scenario: unknown command keys should fail fast during path resolution.
  // Expected: helper throws when key is not part of the registry.
  it("throws for unknown command keys", () => {
    expect(() =>
      getPredefinedCommandBatPath("C:\\repo", "unknown-command" as "touch")
    ).toThrow("Unknown predefined command key");
  });
});
