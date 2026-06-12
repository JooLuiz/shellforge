interface InterpolationSuggestionsListProps {
  suggestions: readonly string[];
  highlightedIndex: number;
  onSelect: (variableName: string) => void;
}

export function InterpolationSuggestionsList({
  suggestions,
  highlightedIndex,
  onSelect,
}: InterpolationSuggestionsListProps): JSX.Element | null {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <ul className="interpolation-suggestions" role="listbox">
      {suggestions.map((variableName, suggestionIndex) => (
        <li key={variableName}>
          <button
            type="button"
            role="option"
            aria-selected={suggestionIndex === highlightedIndex}
            className={
              suggestionIndex === highlightedIndex
                ? "interpolation-suggestions-option interpolation-suggestions-option-active"
                : "interpolation-suggestions-option"
            }
            onMouseDown={(event) => {
              event.preventDefault();
              onSelect(variableName);
            }}
          >
            {variableName}
          </button>
        </li>
      ))}
    </ul>
  );
}
