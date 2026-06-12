import {
  SCHEDULED_TASK_ADMIN_REQUIRED_SNIPPET,
  SCHEDULED_TASK_REGISTRATION_SCRIPT_ERROR_SNIPPET,
  SCHEDULED_TASK_SUCCESS_SNIPPET,
} from "../../shared/scheduledTaskMessages";

export {
  SCHEDULED_TASK_ADMIN_REQUIRED_ERROR,
  SCHEDULED_TASK_ADMIN_REQUIRED_SNIPPET,
  SCHEDULED_TASK_REGISTRATION_FAILED_ERROR,
  SCHEDULED_TASK_REGISTRATION_SCRIPT_ERROR_SNIPPET,
  SCHEDULED_TASK_SUCCESS_SNIPPET,
} from "../../shared/scheduledTaskMessages";

export function outputRequiresAdministrator(stdout: string, stderr: string): boolean {
  const combinedOutput = `${stdout}\n${stderr}`;
  return combinedOutput.includes(SCHEDULED_TASK_ADMIN_REQUIRED_SNIPPET);
}

export function outputReportsRegistrationFailure(stdout: string, stderr: string): boolean {
  const combinedOutput = `${stdout}\n${stderr}`;
  return combinedOutput.includes(SCHEDULED_TASK_REGISTRATION_SCRIPT_ERROR_SNIPPET);
}

export function outputReportsRegistrationSuccess(stdout: string, stderr: string): boolean {
  const combinedOutput = `${stdout}\n${stderr}`;
  return combinedOutput.includes(SCHEDULED_TASK_SUCCESS_SNIPPET);
}
