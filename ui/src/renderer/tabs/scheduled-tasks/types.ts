import type { ActionConfig, CustomActionUiConfig, ScheduledTaskRecord } from "../../../shared/types";

export interface ScheduledTasksTabProps {
  actionRunner: Record<string, ActionConfig>;
  customActions: Record<string, CustomActionUiConfig>;
  scheduledTasks: ScheduledTaskRecord[];
  refreshScheduledTasks: () => Promise<void>;
  isLoadingScheduledTasks: boolean;
  scheduledTasksLoadError: string | null;
  commandOptions: string[];
  searchQuery: string;
}

export type ModalMode = "create" | "edit" | null;
export type EditSaveStatus = "dirty" | "saving" | "saved";

export interface ScheduledTaskEditorState {
  modalMode: ModalMode;
  isSaving: boolean;
  draft: ScheduledTaskInput;
  errorMessage: string | null;
  editSaveStatus: EditSaveStatus;
  saveButtonLabel: string;
}
