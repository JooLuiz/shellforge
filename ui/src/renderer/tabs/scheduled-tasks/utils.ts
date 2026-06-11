import type { AppConfig, ScheduledTaskInput } from "../../../shared/types";
import { WEEKDAY_SHORT_LABELS } from "./constants";
import type { EditSaveStatus, ModalMode } from "./types";

export function serializeTaskDraft(draft: ScheduledTaskInput): string {
  return JSON.stringify({
    ...draft,
    commandMetadata: draft.commandMetadata ?? null,
    triggerTimes: [...draft.triggerTimes].sort((leftTime, rightTime) =>
      leftTime.localeCompare(rightTime),
    ),
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

export function buildCliAvailableCommandOptions(
  customActions: AppConfig["ui"]["customActions"],
): string[] {
  return normalizeCommandOptions(
    Object.entries(customActions)
      .filter(([, customAction]) => customAction.availableOnCLI)
      .map(([actionName, customAction]) => customAction.aliases[0] ?? actionName),
  );
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
