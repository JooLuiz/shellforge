import { describe, expect, it } from "vitest";
import { parseScheduledTaskContent } from "./ps1Parser";

describe("parseScheduledTaskContent", () => {
  it("parses scheduled task script fields", () => {
    const content = [
      "# managed by ShellForge UI",
      '$TaskName = "SampleAction"',
      '$triggerTimes = @("23:00")',
      "$weekdays = @(",
      "    [System.DayOfWeek]::Monday,",
      "    [System.DayOfWeek]::Tuesday,",
      "    [System.DayOfWeek]::Wednesday,",
      "    [System.DayOfWeek]::Thursday,",
      "    [System.DayOfWeek]::Friday",
      ")",
      '$actionArguments = "-NoProfile -ExecutionPolicy Bypass -Command `". \'$profilePath\'; sample-action`""',
    ].join("\r\n");

    const parsedTask = parseScheduledTaskContent("setup-sample-action-task.ps1", content);

    expect(parsedTask.actionName).toBe("SampleAction");
    expect(parsedTask.triggerTimes).toEqual(["23:00"]);
    expect(parsedTask.weekdays).toEqual(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
    expect(parsedTask.command).toBe("sample-action");
  });

  it("parses scheduled command metadata comment when present", () => {
    const content = [
      "# managed by ShellForge UI",
      '# shellforge:scheduledCommandV1 {"version":1,"kind":"customActionAlias","alias":"sample-action","actionName":"SampleAction","verbose":true,"actionArgs":{"taskId":"ABC"}}',
      '$TaskName = "SampleAction"',
      '$triggerTimes = @("23:00")',
      "$weekdays = @(",
      "    [System.DayOfWeek]::Monday",
      ")",
      '$actionArguments = "-NoProfile -ExecutionPolicy Bypass -Command `". \'$profilePath\'; sample-action -v --arg.taskId=ABC`""',
    ].join("\r\n");

    const parsedTask = parseScheduledTaskContent("setup-sample-action-task.ps1", content);

    expect(parsedTask.commandMetadata).toEqual({
      version: 1,
      kind: "customActionAlias",
      alias: "sample-action",
      actionName: "SampleAction",
      verbose: true,
      actionArgs: { taskId: "ABC" },
    });
  });
});
