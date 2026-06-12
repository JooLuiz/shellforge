import PrettyIcons from "js-pretty-icons";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

interface ScheduledTaskCommandFieldProps {
  value: string;
  commandOptions: readonly string[];
  onChange: (nextValue: string) => void;
}

export function ScheduledTaskCommandField({
  value,
  commandOptions,
  onChange,
}: ScheduledTaskCommandFieldProps): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!pickerOpen) {
      return;
    }

    const handleDocumentMouseDown = (event: MouseEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, [pickerOpen]);

  const handleOptionSelect = (commandOption: string): void => {
    onChange(commandOption);
    setPickerOpen(false);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (pickerOpen && event.key === "Escape") {
      event.preventDefault();
      setPickerOpen(false);
    }
  };

  return (
    <div className="scheduled-task-command-field" ref={rootRef}>
      <div className="scheduled-task-command-field-input-wrap">
        <input
          ref={inputRef}
          className="scheduled-task-command-field-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleInputKeyDown}
          aria-label="Command"
        />
        <button
          type="button"
          className="scheduled-task-command-field-chevron"
          aria-label="Show command options"
          aria-expanded={pickerOpen}
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onClick={() => {
            setPickerOpen((previousOpen) => !previousOpen);
          }}
        >
          <PrettyIcons icon="chevron-down" width={18} height={18} color="currentColor" />
        </button>
      </div>
      {pickerOpen && commandOptions.length > 0 ? (
        <ul className="scheduled-task-command-picker" role="listbox">
          {commandOptions.map((commandOption) => (
            <li key={commandOption}>
              <button
                type="button"
                role="option"
                className="scheduled-task-command-picker-option"
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleOptionSelect(commandOption);
                }}
              >
                {commandOption}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
