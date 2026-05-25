import type { ScheduledTaskInput, ScheduledTaskRecord } from "../../../shared/types";

export interface ScheduledTasksTabProps {
  scheduledTasks: ScheduledTaskRecord[];
  refreshScheduledTasks: () => Promise<void>;
  commandOptions: string[];
  createRequestToken?: number;
  onCreateRequestConsumed?: () => void;
}

export type ModalMode = "create" | "edit" | null;
export type EditSaveStatus = "dirty" | "saving" | "saved";

export interface ScheduledTaskEditorState {
  modalMode: ModalMode;
  isSaving: boolean;
  draft: ScheduledTaskInput;
  triggerTimesInput: string;
  errorMessage: string | null;
  editSaveStatus: EditSaveStatus;
  saveButtonLabel: string;
}
