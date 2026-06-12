import { useCallback, useMemo, useState, type KeyboardEvent } from "react";
import {
  applyContextTokenCompletion,
  filterVariablesByPartialName,
  findActiveContextToken,
} from "../../utils/interpolationTokenUtils";

interface UseInterpolationInputOptions {
  value: string;
  availableVariables: readonly string[];
  onChange: (nextValue: string) => void;
}

interface UseInterpolationInputResult {
  suggestionsOpen: boolean;
  filteredSuggestions: string[];
  highlightedSuggestionIndex: number;
  handleInputChange: (nextValue: string, cursorPosition: number) => void;
  handleKeyDown: (
    event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => boolean;
  handleSuggestionSelect: (
    variableName: string,
    inputElement: HTMLInputElement | HTMLTextAreaElement,
  ) => void;
  closeSuggestions: () => void;
}

export function useInterpolationInput({
  value,
  availableVariables,
  onChange,
}: UseInterpolationInputOptions): UseInterpolationInputResult {
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeTokenStart, setActiveTokenStart] = useState<number | null>(null);
  const [activePartialName, setActivePartialName] = useState("");
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState(0);

  const filteredSuggestions = useMemo(
    () => filterVariablesByPartialName(availableVariables, activePartialName),
    [activePartialName, availableVariables],
  );

  const closeSuggestions = useCallback((): void => {
    setSuggestionsOpen(false);
    setActiveTokenStart(null);
    setActivePartialName("");
    setHighlightedSuggestionIndex(0);
  }, []);

  const applySuggestion = useCallback(
    (
      variableName: string,
      inputElement: HTMLInputElement | HTMLTextAreaElement,
      cursorPosition: number,
    ): void => {
      if (activeTokenStart === null) {
        return;
      }

      const { nextValue, nextCursor } = applyContextTokenCompletion(
        value,
        activeTokenStart,
        cursorPosition,
        variableName,
      );

      onChange(nextValue);
      closeSuggestions();

      requestAnimationFrame(() => {
        inputElement.focus();
        inputElement.setSelectionRange(nextCursor, nextCursor);
      });
    },
    [activeTokenStart, closeSuggestions, onChange, value],
  );

  const handleInputChange = useCallback(
    (nextValue: string, cursorPosition: number): void => {
      onChange(nextValue);

      const activeToken = findActiveContextToken(nextValue.slice(0, cursorPosition));
      if (!activeToken) {
        closeSuggestions();
        return;
      }

      const nextSuggestions = filterVariablesByPartialName(
        availableVariables,
        activeToken.partialName,
      );

      if (nextSuggestions.length === 0) {
        closeSuggestions();
        return;
      }

      setActiveTokenStart(activeToken.tokenStart);
      setActivePartialName(activeToken.partialName);
      setHighlightedSuggestionIndex(0);
      setSuggestionsOpen(true);
    },
    [availableVariables, closeSuggestions, onChange],
  );

  const handleSuggestionSelect = useCallback(
    (
      variableName: string,
      inputElement: HTMLInputElement | HTMLTextAreaElement,
    ): void => {
      applySuggestion(variableName, inputElement, inputElement.selectionStart ?? value.length);
    },
    [applySuggestion, value.length],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): boolean => {
      if (!suggestionsOpen || filteredSuggestions.length === 0) {
        return false;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightedSuggestionIndex(
          (previousIndex) => (previousIndex + 1) % filteredSuggestions.length,
        );
        return true;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightedSuggestionIndex(
          (previousIndex) =>
            (previousIndex - 1 + filteredSuggestions.length) % filteredSuggestions.length,
        );
        return true;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeSuggestions();
        return true;
      }

      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        const selectedVariable = filteredSuggestions[highlightedSuggestionIndex];
        if (selectedVariable) {
          applySuggestion(
            selectedVariable,
            event.currentTarget,
            event.currentTarget.selectionStart ?? value.length,
          );
        }
        return true;
      }

      return false;
    },
    [
      applySuggestion,
      closeSuggestions,
      filteredSuggestions,
      highlightedSuggestionIndex,
      suggestionsOpen,
      value.length,
    ],
  );

  return {
    suggestionsOpen,
    filteredSuggestions,
    highlightedSuggestionIndex,
    handleInputChange,
    handleKeyDown,
    handleSuggestionSelect,
    closeSuggestions,
  };
}
