import type { ScheduledTaskInput } from "../../../../shared/types";
import {
  getScheduledTaskActionNameFormatError,
  validateScheduledTaskActionName,
} from "../../../../shared/scheduledTaskActionName";
import { ModalCloseButton } from "../../../components/ModalCloseButton";
import { useModalDismiss } from "../../../hooks/useModalDismiss";
import { useTranslation } from "../../../i18n";
import type { ActionArgumentSchema } from "../../../../shared/actionArgumentSchema";
import type { ScheduledCommandDraft } from "../../../../shared/scheduledTaskCommand";
import { WEEKDAYS } from "../constants";
import type { EditSaveStatus, ModalMode } from "../types";
import { ScheduledTaskCommandSection } from "./ScheduledTaskCommandSection";
import { ScheduledTaskTriggerTimesField } from "./ScheduledTaskTriggerTimesField";

interface ScheduledTaskModalProps {
  argumentSchema: ActionArgumentSchema | null;
  commandDraft: ScheduledCommandDraft;
  commandOptions: string[];
  draft: ScheduledTaskInput;
  editSaveStatus: EditSaveStatus;
  errorMessage: string | null;
  isSaving: boolean;
  modalMode: Exclude<ModalMode, null>;
  onClose: () => void;
  onPersist: () => Promise<void>;
  onUpdateCommandDraft: (
    updater: (previousDraft: ScheduledCommandDraft) => ScheduledCommandDraft,
  ) => void;
  onUpdateDraft: (updater: (previousDraft: ScheduledTaskInput) => ScheduledTaskInput) => void;
  saveButtonLabel: string;
}

export function ScheduledTaskModal({
  argumentSchema,
  commandDraft,
  commandOptions,
  draft,
  editSaveStatus,
  errorMessage,
  isSaving,
  modalMode,
  onClose,
  onPersist,
  onUpdateCommandDraft,
  onUpdateDraft,
  saveButtonLabel,
}: ScheduledTaskModalProps): JSX.Element {
  const { t } = useTranslation();
  const { backdropProps, panelProps } = useModalDismiss(onClose);
  const actionNameFormatError = getScheduledTaskActionNameFormatError(draft.actionName);
  const actionNameValidationError = actionNameFormatError
    ? t.scheduledTasks.invalidActionName
    : null;
  const isSaveDisabled =
    isSaving ||
    validateScheduledTaskActionName(draft.actionName) !== null ||
    (modalMode === "edit" && editSaveStatus === "saved");

  return (
    <div className="modal-backdrop" {...backdropProps}>
      <div className="modal" {...panelProps}>
        <header className="modal-header">
          <h3>{modalMode === "edit" ? "Edit Scheduled Task" : "Create Scheduled Task"}</h3>
          <ModalCloseButton onClick={onClose} />
        </header>
        <div className="modal-body">
          <div className="scheduled-modal-grid">
            <div className="scheduled-modal-left">
              <label className="field-block">
                Task Name
                <input
                  value={draft.actionName}
                  onChange={(event) =>
                    onUpdateDraft((previousDraft) => ({
                      ...previousDraft,
                      actionName: event.target.value,
                    }))
                  }
                />
              </label>
              {actionNameValidationError ? (
                <div className="error-banner">{actionNameValidationError}</div>
              ) : null}
              <ScheduledTaskCommandSection
                argumentSchema={argumentSchema}
                commandDraft={commandDraft}
                commandOptions={commandOptions}
                onChange={(nextCommandDraft) => onUpdateCommandDraft(() => nextCommandDraft)}
              />
              <ScheduledTaskTriggerTimesField
                triggerTimes={draft.triggerTimes}
                onChange={(nextTimes) =>
                  onUpdateDraft((previousDraft) => ({
                    ...previousDraft,
                    triggerTimes: nextTimes,
                  }))
                }
              />
            </div>
            <div className="scheduled-modal-right">
              <div className="field-block">
                Days of week
                <div className="weekdays-grid">
                  {WEEKDAYS.map((weekday) => {
                    const isSelected = draft.weekdays.includes(weekday);
                    return (
                      <label key={weekday} className="inline-field">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(event) =>
                            onUpdateDraft((previousDraft) => ({
                              ...previousDraft,
                              weekdays: event.target.checked
                                ? [...previousDraft.weekdays, weekday]
                                : previousDraft.weekdays.filter((day) => day !== weekday),
                            }))
                          }
                        />
                        <span>{weekday}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}
          <div className="modal-actions">
            <button type="button" className="button button-red" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="button button-teal"
              onClick={() => void onPersist()}
              disabled={isSaveDisabled}
            >
              {saveButtonLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
