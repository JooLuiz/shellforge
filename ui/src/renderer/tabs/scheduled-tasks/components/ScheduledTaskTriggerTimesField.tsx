import { useMemo, useState } from "react";
import {
  DEFAULT_TRIGGER_TIME,
  sortTriggerTimes,
} from "../utils/triggerTimeUtils";
import { TriggerTimePickerModal } from "./TriggerTimePickerModal";

type PickerMode =
  | { mode: "add" }
  | { mode: "edit"; index: number }
  | null;

interface ScheduledTaskTriggerTimesFieldProps {
  triggerTimes: string[];
  onChange: (nextTimes: string[]) => void;
}

export function ScheduledTaskTriggerTimesField({
  triggerTimes,
  onChange,
}: ScheduledTaskTriggerTimesFieldProps): JSX.Element {
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);

  const sortedTriggerTimes = useMemo(
    () => sortTriggerTimes(triggerTimes),
    [triggerTimes],
  );

  const defaultAddTime =
    sortedTriggerTimes[sortedTriggerTimes.length - 1] ?? DEFAULT_TRIGGER_TIME;

  const closePicker = (): void => {
    setPickerMode(null);
  };

  const handleAddTime = (time: string): void => {
    onChange(sortTriggerTimes([...triggerTimes, time]));
    closePicker();
  };

  const handleEditTime = (index: number, time: string): void => {
    const nextTimes = [...triggerTimes];
    nextTimes[index] = time;
    onChange(sortTriggerTimes(nextTimes));
    closePicker();
  };

  const handleRemoveTime = (timeToRemove: string): void => {
    onChange(triggerTimes.filter((time) => time !== timeToRemove));
  };

  const openEditPicker = (time: string): void => {
    const originalIndex = triggerTimes.indexOf(time);
    if (originalIndex < 0) {
      return;
    }
    setPickerMode({ mode: "edit", index: originalIndex });
  };

  return (
    <div className="field-block">
      <span>Execution times</span>
      <div className="scheduled-trigger-times">
        {sortedTriggerTimes.map((time) => (
          <div key={time} className="scheduled-trigger-time-chip">
            <button
              type="button"
              className="scheduled-trigger-time-chip-label"
              onClick={() => openEditPicker(time)}
            >
              {time}
            </button>
            <button
              type="button"
              className="scheduled-trigger-time-chip-remove"
              aria-label={`Remove ${time}`}
              onClick={() => handleRemoveTime(time)}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="button button-blue scheduled-trigger-time-add"
          aria-label="Add execution time"
          onClick={() => setPickerMode({ mode: "add" })}
        >
          +
        </button>
      </div>
      {sortedTriggerTimes.length === 0 ? (
        <p className="scheduled-trigger-times-hint">Add at least one time.</p>
      ) : null}
      {pickerMode?.mode === "add" ? (
        <TriggerTimePickerModal
          mode="add"
          existingTimes={triggerTimes}
          initialTime={defaultAddTime}
          onClose={closePicker}
          onConfirm={handleAddTime}
        />
      ) : null}
      {pickerMode?.mode === "edit" ? (
        <TriggerTimePickerModal
          mode="edit"
          existingTimes={triggerTimes}
          initialTime={triggerTimes[pickerMode.index] ?? DEFAULT_TRIGGER_TIME}
          editIndex={pickerMode.index}
          onClose={closePicker}
          onConfirm={(time) => handleEditTime(pickerMode.index, time)}
        />
      ) : null}
    </div>
  );
}
