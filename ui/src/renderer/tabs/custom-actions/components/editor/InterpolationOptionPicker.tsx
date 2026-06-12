import type { InterpolationFieldOption } from "../../utils/interpolationFieldOptions";

interface InterpolationOptionPickerProps {
  options: readonly InterpolationFieldOption[];
  onSelect: (optionValue: string) => void;
}

export function InterpolationOptionPicker({
  options,
  onSelect,
}: InterpolationOptionPickerProps): JSX.Element | null {
  if (options.length === 0) {
    return null;
  }

  return (
    <ul className="interpolation-suggestions" role="listbox">
      {options.map((option) => (
        <li key={option.value}>
          <button
            type="button"
            role="option"
            className="interpolation-suggestions-option"
            onMouseDown={(event) => {
              event.preventDefault();
              onSelect(option.value);
            }}
          >
            {option.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
