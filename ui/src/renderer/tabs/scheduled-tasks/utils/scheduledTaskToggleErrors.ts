import { SCHEDULED_TASK_INVALID_ACTION_NAME_MESSAGE } from "../../../../shared/scheduledTaskActionName";
import { SCHEDULED_TASK_REGISTRATION_FAILED_ERROR } from "../../../../shared/scheduledTaskMessages";

interface ScheduledTaskToggleErrorMessages {
  adminRequiredErrorMessage: string;
  invalidActionNameMessage: string;
  toggleFailedMessage: string;
  toggleRegistrationFailedMessage: string;
}

export function mapScheduledTaskToggleErrorMessage(
  errorMessage: string,
  messages: ScheduledTaskToggleErrorMessages,
): string {
  if (errorMessage.includes("Administrator privileges are required")) {
    return messages.adminRequiredErrorMessage;
  }

  if (
    errorMessage.includes(SCHEDULED_TASK_INVALID_ACTION_NAME_MESSAGE) ||
    errorMessage.includes("Action name cannot be empty")
  ) {
    return messages.invalidActionNameMessage;
  }

  if (errorMessage.includes(SCHEDULED_TASK_REGISTRATION_FAILED_ERROR)) {
    return messages.toggleRegistrationFailedMessage;
  }

  if (errorMessage.startsWith("Failed to enable scheduled task") ||
      errorMessage.startsWith("Failed to disable scheduled task")) {
    return messages.toggleFailedMessage;
  }

  return errorMessage;
}
