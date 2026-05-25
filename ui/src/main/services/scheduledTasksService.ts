import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { ScheduledTaskInput, ScheduledTaskRecord } from "../../shared/types";
import { listScheduledTaskRecords } from "./ps1Parser";
import { buildScheduledTaskFileName, generateScheduledTaskScript } from "./ps1Template";
import { getRepoPaths } from "./repoPaths";

function validateTime(timeValue: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(timeValue);
}

function validateScheduledTaskInput(input: ScheduledTaskInput): void {
  if (input.actionName.trim().length === 0) {
    throw new Error("Action name cannot be empty.");
  }

  if (input.triggerTimes.length === 0) {
    throw new Error("Provide at least one trigger time.");
  }

  if (!input.triggerTimes.every(validateTime)) {
    throw new Error("Trigger times must be formatted as HH:mm.");
  }

  if (input.weekdays.length === 0) {
    throw new Error("Provide at least one weekday.");
  }

  if (input.command.trim().length === 0) {
    throw new Error("Command cannot be empty.");
  }
}

function listRegisteredTaskNames(): Set<string> {
  try {
    const output = execFileSync(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        "$ErrorActionPreference = 'SilentlyContinue'; Get-ScheduledTask | Select-Object -ExpandProperty TaskName",
      ],
      { encoding: "utf8" }
    );

    const taskNames = output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    return new Set(taskNames);
  } catch {
    return new Set();
  }
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown command execution error";
}

export function buildScheduledTaskCommandArgs(scriptPath: string, isEnabled: boolean): string[] {
  const commandArgs = ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", scriptPath];
  if (!isEnabled) {
    commandArgs.push("-Remove");
  }
  return commandArgs;
}

function runScheduledTaskScript(fileName: string, isEnabled: boolean): void {
  const { scheduledTasksDir } = getRepoPaths();
  const scriptPath = path.join(scheduledTasksDir, fileName);
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Scheduled task script not found: ${scriptPath}`);
  }

  const commandArgs = buildScheduledTaskCommandArgs(scriptPath, isEnabled);

  try {
    execFileSync("powershell", commandArgs, {
      encoding: "utf8",
      stdio: "pipe",
    });
  } catch (error) {
    throw new Error(
      `Failed to ${isEnabled ? "enable" : "disable"} scheduled task from "${fileName}". ${toErrorMessage(
        error
      )}`
    );
  }
}

export function listScheduledTasks(): ScheduledTaskRecord[] {
  const registeredTaskNames = listRegisteredTaskNames();
  return listScheduledTaskRecords().map((taskRecord) => ({
    ...taskRecord,
    isEnabled: registeredTaskNames.has(taskRecord.actionName),
  }));
}

export function saveScheduledTask(input: ScheduledTaskInput): string {
  validateScheduledTaskInput(input);

  const { scheduledTasksDir } = getRepoPaths();
  const nextFileName = buildScheduledTaskFileName(input.actionName);
  const nextFilePath = path.join(scheduledTasksDir, nextFileName);
  const scriptContent = generateScheduledTaskScript(input);
  fs.writeFileSync(nextFilePath, scriptContent, "utf8");

  if (input.originalFileName && input.originalFileName !== nextFileName) {
    const oldFilePath = path.join(scheduledTasksDir, input.originalFileName);
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }
  }

  return nextFileName;
}

export function deleteScheduledTask(fileName: string): void {
  const { scheduledTasksDir } = getRepoPaths();
  const filePath = path.join(scheduledTasksDir, fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function toggleScheduledTask(fileName: string, isEnabled: boolean): void {
  runScheduledTaskScript(fileName, isEnabled);
}
