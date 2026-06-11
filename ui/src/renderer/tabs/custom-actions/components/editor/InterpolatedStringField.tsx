import PrettyIcons from "js-pretty-icons";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { buildInterpolationFieldOptions } from "../../utils/interpolationFieldOptions";
import { InterpolationOptionPicker } from "./InterpolationOptionPicker";
import { InterpolationSuggestionsList } from "./InterpolationSuggestionsList";
import { useInterpolationInput } from "./useInterpolationInput";

interface InterpolatedStringFieldProps {
  value: string;
  onChange: (nextValue: string) => void;
  availableVariables: readonly string[];
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

export function InterpolatedStringField({
  value,
  onChange,
  availableVariables,
  placeholder,
  className,
  ariaLabel,
}: InterpolatedStringFieldProps): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const isEmpty = value.trim().length === 0;

  const fieldOptions = useMemo(
    () => buildInterpolationFieldOptions(availableVariables),
    [availableVariables],
  );

  const {
    suggestionsOpen,
    filteredSuggestions,
    highlightedSuggestionIndex,
    handleInputChange,
    handleKeyDown,
    handleSuggestionSelect,
    closeSuggestions,
  } = useInterpolationInput({
    value,
    availableVariables,
    onChange,
  });

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

  const closePicker = (): void => {
    setPickerOpen(false);
  };

  const handleOptionSelect = (optionValue: string): void => {
    onChange(optionValue);
    closePicker();
    closeSuggestions();
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (pickerOpen && event.key === "Escape") {
      event.preventDefault();
      closePicker();
      return;
    }

    handleKeyDown(event);
  };

  const inputClassName = [
    className,
    isEmpty ? "interpolated-string-field-input-with-chevron" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="interpolated-string-field" ref={rootRef}>
      <div className="interpolated-string-field-input-wrap">
        <input
          ref={inputRef}
          className={inputClassName}
          value={value}
          placeholder={placeholder}
          aria-label={ariaLabel}
          onChange={(event) => {
            handleInputChange(
              event.target.value,
              event.target.selectionStart ?? value.length,
              event.target,
            );
            if (event.target.value.trim().length > 0) {
              closePicker();
            }
          }}
          onKeyDown={handleInputKeyDown}
          onBlur={() => {
            closeSuggestions();
          }}
        />
        {isEmpty ? (
          <button
            type="button"
            className="interpolated-string-field-chevron"
            aria-label="Show variable options"
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
        ) : null}
      </div>
      {pickerOpen ? (
        <InterpolationOptionPicker options={fieldOptions} onSelect={handleOptionSelect} />
      ) : null}
      {suggestionsOpen ? (
        <InterpolationSuggestionsList
          suggestions={filteredSuggestions}
          highlightedIndex={highlightedSuggestionIndex}
          onSelect={(variableName) => {
            if (inputRef.current) {
              handleSuggestionSelect(variableName, inputRef.current);
            }
          }}
        />
      ) : null}
    </div>
  );
}
