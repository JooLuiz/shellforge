export const SCHEDULED_TASK_ACTION_NAME_PATTERN =
  /^[A-Za-z0-9]+(?:[ A-Za-z0-9_-]*[A-Za-z0-9]+)?$/;

export const SCHEDULED_TASK_INVALID_ACTION_NAME_MESSAGE =
  "Task name must use only ASCII letters, numbers, spaces, hyphens, and underscores.";

export function getScheduledTaskActionNameFormatError(actionName: string): string | null {
  const trimmedActionName = actionName.trim();
  if (trimmedActionName.length === 0) {
    return null;
  }

  if (actionName !== trimmedActionName) {
    return SCHEDULED_TASK_INVALID_ACTION_NAME_MESSAGE;
  }

  if (!SCHEDULED_TASK_ACTION_NAME_PATTERN.test(actionName)) {
    return SCHEDULED_TASK_INVALID_ACTION_NAME_MESSAGE;
  }

  return null;
}

export function validateScheduledTaskActionName(actionName: string): string | null {
  const trimmedActionName = actionName.trim();
  if (trimmedActionName.length === 0) {
    return "Action name cannot be empty.";
  }

  if (actionName !== trimmedActionName) {
    return SCHEDULED_TASK_INVALID_ACTION_NAME_MESSAGE;
  }

  if (!SCHEDULED_TASK_ACTION_NAME_PATTERN.test(actionName)) {
    return SCHEDULED_TASK_INVALID_ACTION_NAME_MESSAGE;
  }

  return null;
}
