import { describe, expect, it } from "vitest";
import type { ScheduledTaskRecord } from "../../../../shared/types";
import { filterScheduledTasks } from "./scheduledTaskSearch";

describe("filterScheduledTasks", () => {
  const scheduledTasks: ScheduledTaskRecord[] = [
    {
      fileName: "setup-clockify.ps1",
      actionName: "clockify-task",
      triggerTimes: ["09:00"],
      weekdays: ["Monday"],
      command: "clockify-login",
      isEnabled: true,
    },
    {
      fileName: "setup-message.ps1",
      actionName: "message-task",
      triggerTimes: ["18:30"],
      weekdays: ["Friday"],
      command: "send-message",
      isEnabled: false,
    },
  ];

  // Scenario: scheduled tasks tab search by command value.
  // Expected: only tasks whose command matches the query are returned.
  it("matches scheduled task commands during search", () => {
    const filteredTasks = filterScheduledTasks(scheduledTasks, "send-message");

    expect(filteredTasks).toHaveLength(1);
    expect(filteredTasks[0]?.actionName).toBe("message-task");
  });
});
