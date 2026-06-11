import path from "node:path";

const SCHEDULED_TASK_FILE_NAME_PATTERN = /^setup-.+-task\.ps1$/i;

export function assertSafeScheduledTaskFileName(fileName: string): void {
  const normalizedFileName = fileName.trim();
  const baseName = path.basename(normalizedFileName);

  if (
    normalizedFileName.length === 0 ||
    baseName !== normalizedFileName ||
    !SCHEDULED_TASK_FILE_NAME_PATTERN.test(baseName)
  ) {
    throw new Error("Invalid scheduled task file name.");
  }
}

export function resolveScheduledTaskScriptPath(
  scheduledTasksDir: string,
  fileName: string,
): string {
  assertSafeScheduledTaskFileName(fileName);
  return path.join(scheduledTasksDir, fileName);
}
