import { describe, expect, it } from "vitest";
import {
  SCHEDULED_TASK_ADMIN_REQUIRED_SNIPPET,
  SCHEDULED_TASK_SUCCESS_SNIPPET,
} from "../../shared/scheduledTaskMessages";
import {
  outputReportsRegistrationFailure,
  outputReportsRegistrationSuccess,
  outputRequiresAdministrator,
} from "./scheduledTaskScriptErrors";

describe("scheduledTaskScriptErrors", () => {
  it("detects the administrator requirement message in script output", () => {
    expect(
      outputRequiresAdministrator(
        `[ERROR] - ${SCHEDULED_TASK_ADMIN_REQUIRED_SNIPPET}. Right-click PowerShell and select 'Run as administrator'.`,
        "",
      ),
    ).toBe(true);
  });

  it("detects registration failure and success markers", () => {
    expect(
      outputReportsRegistrationFailure("[ERROR] - Failed to create the scheduled task.", ""),
    ).toBe(true);
    expect(
      outputReportsRegistrationSuccess(`${SCHEDULED_TASK_SUCCESS_SNIPPET} 'BaterPonto' created`, ""),
    ).toBe(true);
  });

  it("returns false for unrelated script output", () => {
    expect(outputRequiresAdministrator("[INFO] - nothing to do", "")).toBe(false);
  });
});
