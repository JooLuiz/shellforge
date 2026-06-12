import { describe, expect, it } from "vitest";
import {
  assertSafeScheduledTaskFileName,
  resolveScheduledTaskScriptPath,
} from "./scheduledTaskPathUtils";

describe("scheduledTaskPathUtils", () => {
  it("accepts valid setup task file names", () => {
    expect(() => assertSafeScheduledTaskFileName("setup-sample-action-task.ps1")).not.toThrow();
  });

  it("rejects traversal and invalid file names", () => {
    expect(() => assertSafeScheduledTaskFileName("..\\setup-sample-action-task.ps1")).toThrow(
      "Invalid scheduled task file name.",
    );
    expect(() => assertSafeScheduledTaskFileName("setup-task.ps1")).toThrow(
      "Invalid scheduled task file name.",
    );
    expect(() => assertSafeScheduledTaskFileName("not-a-task.ps1")).toThrow(
      "Invalid scheduled task file name.",
    );
  });

  it("resolves script paths under the scheduled tasks directory", () => {
    const scriptPath = resolveScheduledTaskScriptPath(
      "C:\\repo\\scheduled-tasks",
      "setup-sample-action-task.ps1",
    );

    expect(scriptPath).toBe("C:\\repo\\scheduled-tasks\\setup-sample-action-task.ps1");
  });
});
