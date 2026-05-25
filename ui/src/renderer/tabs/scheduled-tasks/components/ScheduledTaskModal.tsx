import type { ScheduledTaskInput } from "../../../../shared/types";
import { CUSTOM_COMMAND_VALUE, WEEKDAYS } from "../constants";
import type { EditSaveStatus, ModalMode } from "../types";
import { getCommandSelectValue } from "../utils";

interface ScheduledTaskModalProps {
  commandOptions: string[];
  draft: ScheduledTaskInput;
  editSaveStatus: EditSaveStatus;
  errorMessage: string | null;
  isSaving: boolean;
  modalMode: Exclude<ModalMode, null>;
  onClose: () => void;
  onPersist: () => Promise<void>;
  onUpdateDraft: (updater: (previousDraft: ScheduledTaskInput) => ScheduledTaskInput) => void;
  onUpdateTriggerTimesInput: (nextValue: string) => void;
  saveButtonLabel: string;
  triggerTimesInput: string;
}

export function ScheduledTaskModal({
  commandOptions,
  draft,
  editSaveStatus,
  errorMessage,
  isSaving,
  modalMode,
  onClose,
  onPersist,
  onUpdateDraft,
  onUpdateTriggerTimesInput,
  saveButtonLabel,
  triggerTimesInput,
}: ScheduledTaskModalProps): JSX.Element {
  const commandSelectValue = getCommandSelectValue(draft.command, commandOptions);

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header className="modal-header">
          <h3>{modalMode === "edit" ? "Edit Scheduled Task" : "Create Scheduled Task"}</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close modal">
            X
          </button>
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
              <label className="field-block">
                Command
                <select
                  value={commandSelectValue}
                  onChange={(event) => {
                    const selectedCommand = event.target.value;
                    if (selectedCommand === CUSTOM_COMMAND_VALUE) {
                      onUpdateDraft((previousDraft) => ({
                        ...previousDraft,
                        command: commandOptions.includes(previousDraft.command)
                          ? ""
                          : previousDraft.command,
                      }));
                      return;
                    }
                    onUpdateDraft((previousDraft) => ({
                      ...previousDraft,
                      command: selectedCommand,
                    }));
                  }}
                >
                  {commandOptions.map((commandOption) => (
                    <option key={commandOption} value={commandOption}>
                      {commandOption}
                    </option>
                  ))}
                  <option value={CUSTOM_COMMAND_VALUE}>Custom command</option>
                </select>
              </label>
              {commandSelectValue === CUSTOM_COMMAND_VALUE ? (
                <label className="field-block">
                  Custom command
                  <input
                    value={draft.command}
                    onChange={(event) =>
                      onUpdateDraft((previousDraft) => ({
                        ...previousDraft,
                        command: event.target.value,
                      }))
                    }
                  />
                </label>
              ) : null}
              <label className="field-block">
                Hours (HH:mm, comma-separated)
                <input
                  value={triggerTimesInput}
                  onChange={(event) => onUpdateTriggerTimesInput(event.target.value)}
                />
              </label>
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
              disabled={isSaving || (modalMode === "edit" && editSaveStatus === "saved")}
            >
              {saveButtonLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
