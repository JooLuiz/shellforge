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

    expect(scriptContent).toContain('$TaskName = "MeuComando"');
    expect(scriptContent).toContain('$triggerTimes = @("08:00", "17:00")');
    expect(scriptContent).toContain("[System.DayOfWeek]::Monday");
    expect(scriptContent).toContain("[System.DayOfWeek]::Friday");
    expect(scriptContent).toContain("meu-comando --arg=1");
  });
});
