import { describe, expect, it } from "vitest";
import { buildScheduledTaskFileName, generateScheduledTaskScript } from "./ps1Template";

describe("ps1Template", () => {
  it("creates predictable scheduled task file name", () => {
    expect(buildScheduledTaskFileName("ExecutarTarefa")).toBe("setup-executar-tarefa-task.ps1");
  });

  it("generates a script with expected anchors", () => {
    const scriptContent = generateScheduledTaskScript({
      actionName: "MeuComando",
      triggerTimes: ["08:00", "17:00"],
      weekdays: ["Monday", "Friday"],
      command: "meu-comando --arg=1",
    });

    expect(scriptContent).toContain("# managed by ShellForge UI");
    expect(scriptContent).toContain('$TaskName = "MeuComando"');
    expect(scriptContent).toContain("$ErrorActionPreference = 'Stop'");
    expect(scriptContent).toContain("try {");
    expect(scriptContent).toContain("exit 1");
    expect(scriptContent).toContain('$triggerTimes = @("08:00", "17:00")');
    expect(scriptContent).toContain("[System.DayOfWeek]::Monday");
    expect(scriptContent).toContain("[System.DayOfWeek]::Friday");
    expect(scriptContent).toContain("meu-comando --arg=1");
  });

  it("writes scheduled command metadata comment when provided", () => {
    const scriptContent = generateScheduledTaskScript({
      actionName: "Notify",
      triggerTimes: ["09:00"],
      weekdays: ["Monday"],
      command: 'perform-api-request --arg.message="Hi"',
      commandMetadata: {
        version: 1,
        kind: "customActionAlias",
        alias: "perform-api-request",
        actionName: "performApiRequest",
        actionArgs: { message: "Hi" },
      },
    });

    expect(scriptContent).toContain("# shellforge:scheduledCommandV1 ");
    expect(scriptContent).toContain('"alias":"perform-api-request"');
  });
});
