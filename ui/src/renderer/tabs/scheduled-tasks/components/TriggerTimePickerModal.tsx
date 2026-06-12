import { useMemo, useState } from "react";
import { ModalCloseButton } from "../../../components/ModalCloseButton";
import { useModalDismiss } from "../../../hooks/useModalDismiss";
import {
  buildHourOptions,
  buildMinuteOptions,
  DEFAULT_TRIGGER_TIME,
  formatTriggerTime,
  isDuplicateTriggerTime,
  parseTriggerTime,
} from "../utils/triggerTimeUtils";
import { TriggerTimeOptionPicker } from "./TriggerTimeOptionPicker";

type OpenPickerId = "hour" | "minute" | null;

interface TriggerTimePickerModalProps {
  existingTimes: string[];
  initialTime: string;
  mode: "add" | "edit";
  editIndex?: number;
  onClose: () => void;
  onConfirm: (time: string) => void;
}

export function TriggerTimePickerModal({
  existingTimes,
  initialTime,
  mode,
  editIndex,
  onClose,
  onConfirm,
}: TriggerTimePickerModalProps): JSX.Element {
  const parsedInitialTime = parseTriggerTime(initialTime) ?? parseTriggerTime(DEFAULT_TRIGGER_TIME);
  const [selectedHour, setSelectedHour] = useState(
    String(parsedInitialTime?.hour ?? 8).padStart(2, "0"),
  );
  const [selectedMinute, setSelectedMinute] = useState(
    String(parsedInitialTime?.minute ?? 0).padStart(2, "0"),
  );
  const [openPickerId, setOpenPickerId] = useState<OpenPickerId>(null);

  const { backdropProps, panelProps } = useModalDismiss(onClose, { useCapture: true });

  const hourOptions = useMemo(() => buildHourOptions(), []);
  const minuteOptions = useMemo(() => buildMinuteOptions(), []);

  const candidateTime = formatTriggerTime(Number(selectedHour), Number(selectedMinute));
  const isDuplicate = isDuplicateTriggerTime(existingTimes, candidateTime, editIndex);
  const confirmLabel = mode === "add" ? "Add" : "Save";

  const handleConfirm = (): void => {
    if (isDuplicate) {
      return;
    }
    onConfirm(candidateTime);
  };

  return (
    <div className="modal-backdrop modal-backdrop--nested" {...backdropProps}>
      <div className="modal modal--compact" role="dialog" aria-modal="true" {...panelProps}>
        <header className="modal-header">
          <h3>{mode === "add" ? "Add time" : "Edit time"}</h3>
          <ModalCloseButton onClick={onClose} />
        </header>
        <div className="modal-body">
          <div className="trigger-time-picker-fields">
            <label className="field-block">
              Hour
              <TriggerTimeOptionPicker
                ariaLabel="Hour"
                value={selectedHour}
                options={hourOptions}
                isOpen={openPickerId === "hour"}
                onOpenChange={(isOpen) => setOpenPickerId(isOpen ? "hour" : null)}
                onChange={setSelectedHour}
              />
            </label>
            <label className="field-block">
              Minutes
              <TriggerTimeOptionPicker
                ariaLabel="Minutes"
                value={selectedMinute}
                options={minuteOptions}
                isOpen={openPickerId === "minute"}
                onOpenChange={(isOpen) => setOpenPickerId(isOpen ? "minute" : null)}
                onChange={setSelectedMinute}
              />
            </label>
          </div>
          {isDuplicate ? (
            <div className="error-banner">This time is already scheduled.</div>
          ) : null}
          <div className="modal-actions">
            <button type="button" className="button button-red" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="button button-teal"
              onClick={handleConfirm}
              disabled={isDuplicate}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
