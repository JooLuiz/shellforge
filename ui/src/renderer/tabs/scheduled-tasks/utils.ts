import type { ScheduledTaskInput } from "../../../shared/types";
import { CUSTOM_COMMAND_VALUE, WEEKDAY_SHORT_LABELS } from "./constants";
import type { EditSaveStatus, ModalMode } from "./types";

export function serializeTaskDraft(
  draft: ScheduledTaskInput,
  triggerTimesInput: string
): string {
  return JSON.stringify({
    ...draft,
    triggerTimesInput: triggerTimesInput.trim(),
  });
}

export function formatWeekdays(weekdays: string[]): string {
  return weekdays
    .map((weekday) => WEEKDAY_SHORT_LABELS[weekday] ?? weekday.slice(0, 3))
    .join(", ");
}

export function normalizeCommandOptions(commandOptions: string[]): string[] {
  return Array.from(
    new Set(commandOptions.map((commandOption) => commandOption.trim()).filter(Boolean))
  ).sort((leftOption, rightOption) => leftOption.localeCompare(rightOption));
}

export function parseTriggerTimes(triggerTimesInput: string): string[] {
  return triggerTimesInput
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function getSaveButtonLabel(
  modalMode: ModalMode,
  editSaveStatus: EditSaveStatus,
  isSaving: boolean
): string {
  if (modalMode === "edit") {
    if (editSaveStatus === "saving") {
      return "Saving...";
    }
    if (editSaveStatus === "saved") {
      return "Saved";
    }
    return "Save";
  }
  return isSaving ? "Saving..." : "Save";
}

export function getCommandSelectValue(
  command: string,
  normalizedCommandOptions: string[]
): string {
  return normalizedCommandOptions.includes(command) ? command : CUSTOM_COMMAND_VALUE;
}
