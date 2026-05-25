import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseScheduledTaskContent } from "./ps1Parser";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

function readScheduledTaskFixture(fileName: string): string {
  const fixturePath = path.resolve(
    currentDirectory,
    "../../../..",
    "scheduled-tasks",
    fileName
  );
  return fs.readFileSync(fixturePath, "utf8");
}

describe("parseScheduledTaskContent", () => {
  it("parses existing scheduled task script fields", () => {
    const content = readScheduledTaskFixture("setup-bater-ponto-task.ps1");
    const parsedTask = parseScheduledTaskContent("setup-bater-ponto-task.ps1", content);

    expect(parsedTask.actionName).toBe("BaterPonto");
    expect(parsedTask.triggerTimes).toEqual(["07:58", "11:58", "12:58", "16:58"]);
    expect(parsedTask.weekdays).toEqual(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
    expect(parsedTask.command).toBe("bater-ponto");
  });

  it("parses legacy triggerTime scripts with single schedule values", () => {
    const content = readScheduledTaskFixture("setup-lancar-horas-task.ps1");
    const parsedTask = parseScheduledTaskContent("setup-lancar-horas-task.ps1", content);

    expect(parsedTask.actionName).toBe("LancarHoras");
    expect(parsedTask.triggerTimes).toEqual(["04:00"]);
    expect(parsedTask.weekdays).toEqual(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
    expect(parsedTask.command).toBe("lancar-horas");
  });
});
