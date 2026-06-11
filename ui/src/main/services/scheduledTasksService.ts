import { execFile, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { collectActionArgumentSchema } from "../../shared/actionArgumentSchema";
import {
  buildAliasToActionMap,
  parseScheduledCommandDraft,
  validateScheduledCommandDraft,
} from "../../shared/scheduledTaskCommand";
import type { ScheduledTaskInput, ScheduledTaskRecord } from "../../shared/types";
import { readConfig } from "./configService";
import { listScheduledTaskRecords, parseScheduledTaskContent } from "./ps1Parser";
import { buildScheduledTaskFileName, generateScheduledTaskScript } from "./ps1Template";
import { getRepoPaths } from "./repoPaths";
import { resolveScheduledTaskScriptPath } from "./scheduledTaskPathUtils";

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

  const appConfig = readConfig();
  const aliasMap = buildAliasToActionMap(appConfig.ui.customActions);
  const commandDraft = parseScheduledCommandDraft(
    input.command,
    input.commandMetadata ?? null,
    aliasMap,
  );
  const schema =
    commandDraft.actionName && appConfig.actionRunner[commandDraft.actionName]
      ? collectActionArgumentSchema(appConfig.actionRunner[commandDraft.actionName])
      : null;
  const commandValidationError = validateScheduledCommandDraft(commandDraft, schema);
  if (commandValidationError) {
    throw new Error(commandValidationError);
  }
}

function runPowerShellCommandAsync(commandArgs: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      "powershell",
      commandArgs,
      {
        encoding: "utf8",
        windowsHide: true,
        timeout: 15000,
        maxBuffer: 1024 * 1024,
      },
      (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout);
      }
    );
  });
}

async function listRegisteredTaskNames(): Promise<Set<string>> {
  try {
    const output = await runPowerShellCommandAsync([
      "-NoProfile",
      "-Command",
      "$ErrorActionPreference = 'SilentlyContinue'; Get-ScheduledTask | Select-Object -ExpandProperty TaskName",
    ]);

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
  const scriptPath = resolveScheduledTaskScriptPath(scheduledTasksDir, fileName);
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

export async function listScheduledTasks(): Promise<ScheduledTaskRecord[]> {
  const registeredTaskNames = await listRegisteredTaskNames();
  return listScheduledTaskRecords().map((taskRecord) => ({
    ...taskRecord,
    isEnabled: registeredTaskNames.has(taskRecord.actionName),
  }));
}

function readPreviousActionName(
  scheduledTasksDir: string,
  originalFileName: string,
): string | null {
  const oldFilePath = resolveScheduledTaskScriptPath(scheduledTasksDir, originalFileName);
  if (!fs.existsSync(oldFilePath)) {
    return null;
  }

  const oldScriptContent = fs.readFileSync(oldFilePath, "utf8");
  return parseScheduledTaskContent(originalFileName, oldScriptContent).actionName;
}

async function syncScheduledTaskAfterSave(
  input: ScheduledTaskInput,
  nextFileName: string,
  previousActionName: string | null,
): Promise<void> {
  const registeredTaskNames = await listRegisteredTaskNames();
  const isRename = Boolean(input.originalFileName && input.originalFileName !== nextFileName);

  try {
    if (isRename && input.originalFileName && previousActionName) {
      const wasRegistered = registeredTaskNames.has(previousActionName);
      if (wasRegistered) {
        runScheduledTaskScript(input.originalFileName, false);
        runScheduledTaskScript(nextFileName, true);
      }
      return;
    }

    if (registeredTaskNames.has(input.actionName)) {
      runScheduledTaskScript(nextFileName, true);
    }
  } catch (error) {
    throw new Error(
      `Saved script but failed to update Windows scheduled task. ${toErrorMessage(error)}`,
    );
  }
}

export async function saveScheduledTask(input: ScheduledTaskInput): Promise<string> {
  validateScheduledTaskInput(input);

  const { scheduledTasksDir } = getRepoPaths();
  const nextFileName = buildScheduledTaskFileName(input.actionName);
  const nextFilePath = path.join(scheduledTasksDir, nextFileName);

  let previousActionName: string | null = null;
  if (input.originalFileName && input.originalFileName !== nextFileName) {
    previousActionName = readPreviousActionName(scheduledTasksDir, input.originalFileName);
  }

  const scriptContent = generateScheduledTaskScript(input);
  fs.writeFileSync(nextFilePath, scriptContent, "utf8");

  await syncScheduledTaskAfterSave(input, nextFileName, previousActionName);

  if (input.originalFileName && input.originalFileName !== nextFileName) {
    const oldFilePath = resolveScheduledTaskScriptPath(scheduledTasksDir, input.originalFileName);
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }
  }

  return nextFileName;
}

export function deleteScheduledTask(fileName: string): void {
  const { scheduledTasksDir } = getRepoPaths();
  const filePath = resolveScheduledTaskScriptPath(scheduledTasksDir, fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function toggleScheduledTask(fileName: string, isEnabled: boolean): void {
  runScheduledTaskScript(fileName, isEnabled);
}
