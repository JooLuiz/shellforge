import fs from "node:fs";
import path from "node:path";
import type { ScheduledTaskRecord } from "../../shared/types";
import { getRepoPaths } from "./repoPaths";

const EXAMPLE_FILE_NAME = "setup-scheduled-task.example.ps1";

function parseQuotedArrayValues(arrayLiteral: string): string[] {
  const matches = Array.from(arrayLiteral.matchAll(/"([^"]+)"/g));
  return matches.map((match) => match[1]);
}

function parseWeekdays(content: string): string[] {
  const weekdaysSectionMatch = content.match(/\$weekdays\s*=\s*@\(([\s\S]*?)\)/m);
  if (!weekdaysSectionMatch) {
    return [];
  }

  const matches = Array.from(
    weekdaysSectionMatch[1].matchAll(/\[System\.DayOfWeek\]::([A-Za-z]+)/g)
  );
  return matches.map((match) => match[1]);
}

function parseCommand(content: string): string {
  const actionLine = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith("$actionArguments ="));

  if (!actionLine) {
    throw new Error('Missing "$actionArguments" line');
  }

  const lastSemicolonIndex = actionLine.lastIndexOf("; ");
  const trailingTemplateIndex = actionLine.lastIndexOf("`\"\"");
  if (lastSemicolonIndex < 0 || trailingTemplateIndex < 0 || trailingTemplateIndex <= lastSemicolonIndex) {
    throw new Error(`Unable to parse command from action arguments: ${actionLine}`);
  }

  return actionLine.slice(lastSemicolonIndex + 2, trailingTemplateIndex).trim();
}

export function parseScheduledTaskContent(fileName: string, content: string): ScheduledTaskRecord {
  const actionNameMatch = content.match(/\$TaskName\s*=\s*"([^"]+)"/m);
  if (!actionNameMatch) {
    throw new Error('Missing "$TaskName" assignment');
  }

  const triggerTimesMatch = content.match(/\$triggerTimes\s*=\s*@\(([^)]*)\)/m);
  const triggerTimeMatch = content.match(/\$triggerTime\s*=\s*"([^"]+)"/m);
  const parsedTriggerTimes = triggerTimesMatch
    ? parseQuotedArrayValues(triggerTimesMatch[1])
    : triggerTimeMatch
      ? [triggerTimeMatch[1]]
      : null;
  if (!parsedTriggerTimes) {
    throw new Error('Missing "$triggerTimes" or "$triggerTime" assignment');
  }

  return {
    fileName,
    actionName: actionNameMatch[1],
    triggerTimes: parsedTriggerTimes,
    weekdays: parseWeekdays(content),
    command: parseCommand(content),
    isEnabled: false,
  };
}

export function listScheduledTaskRecords(): ScheduledTaskRecord[] {
  const { scheduledTasksDir } = getRepoPaths();
  const files = fs
    .readdirSync(scheduledTasksDir)
    .filter((fileName) => fileName.endsWith(".ps1") && fileName !== EXAMPLE_FILE_NAME)
    .sort((leftFile, rightFile) => leftFile.localeCompare(rightFile));

  return files.map((fileName) => {
    const fullPath = path.join(scheduledTasksDir, fileName);
    const content = fs.readFileSync(fullPath, "utf8");
    try {
      return parseScheduledTaskContent(fileName, content);
    } catch (error) {
      const parseError = error instanceof Error ? error.message : "Unknown parser error";
      return {
        fileName,
        actionName: fileName,
        triggerTimes: [],
        weekdays: [],
        command: "",
        isEnabled: false,
        parseError,
      };
    }
  });
}
