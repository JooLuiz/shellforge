import type { Dispatch, SetStateAction } from "react";
import { useRef } from "react";
import type { StepUpdater } from "../../types";
import { FieldHint } from "./FieldHint";
import { InterpolationSuggestionsList } from "./InterpolationSuggestionsList";
import { useInterpolationInput } from "./useInterpolationInput";

interface JsonFieldEditorProps {
  availableVariables: readonly string[];
  fieldKey: string;
  hint?: string;
  example?: string;
  jsonDraftByFieldId: Record<string, string>;
  jsonErrorByFieldId: Record<string, string>;
  label: string;
  selectedFieldId: string;
  supportsInterpolation?: boolean;
  value: unknown;
  setJsonDraftByFieldId: Dispatch<SetStateAction<Record<string, string>>>;
  setJsonErrorByFieldId: Dispatch<SetStateAction<Record<string, string>>>;
  updateSelectedStep: (updater: StepUpdater) => void;
  supportsInterpolation?: boolean;
}

const CONTEXT_TEMPLATE_REFERENCE_REGEX = /^\{\{\s*(context|env)\.[^}]+\s*\}\}$/;

function applyJsonDraftChange(
  nextRawValue: string,
  fieldKey: string,
  selectedFieldId: string,
  setJsonDraftByFieldId: Dispatch<SetStateAction<Record<string, string>>>,
  setJsonErrorByFieldId: Dispatch<SetStateAction<Record<string, string>>>,
  updateSelectedStep: (updater: StepUpdater) => void,
  supportsInterpolation = false,
): void {
  setJsonDraftByFieldId((previousDraftByFieldId) => ({
    ...previousDraftByFieldId,
    [selectedFieldId]: nextRawValue,
  }));

  try {
    const parsedJsonValue = JSON.parse(nextRawValue) as unknown;
    updateSelectedStep((stepDraft) => ({
      ...stepDraft,
      [fieldKey]: parsedJsonValue,
    }));
    setJsonErrorByFieldId((previousErrorByFieldId) => ({
      ...previousErrorByFieldId,
      [selectedFieldId]: "",
    }));
  } catch {
    const trimmedValue = nextRawValue.trim();
    if (supportsInterpolation && CONTEXT_TEMPLATE_REFERENCE_REGEX.test(trimmedValue)) {
      updateSelectedStep((stepDraft) => ({
        ...stepDraft,
        [fieldKey]: trimmedValue,
      }));
      setJsonErrorByFieldId((previousErrorByFieldId) => ({
        ...previousErrorByFieldId,
        [selectedFieldId]: "",
      }));
      return;
    }

    setJsonErrorByFieldId((previousErrorByFieldId) => ({
      ...previousErrorByFieldId,
      [selectedFieldId]: "Invalid JSON format.",
    }));
  }
}

export function JsonFieldEditor({
  availableVariables,
  fieldKey,
  hint,
  example,
  jsonDraftByFieldId,
  jsonErrorByFieldId,
  label,
  selectedFieldId,
  supportsInterpolation = false,
  value,
  setJsonDraftByFieldId,
  setJsonErrorByFieldId,
  updateSelectedStep,
}: JsonFieldEditorProps): JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nextJsonValue = value === undefined ? "" : JSON.stringify(value, null, 2);
  const jsonDraftValue = jsonDraftByFieldId[selectedFieldId] ?? nextJsonValue;
  const jsonErrorMessage = jsonErrorByFieldId[selectedFieldId];

  const {
    suggestionsOpen,
    filteredSuggestions,
    highlightedSuggestionIndex,
    handleInputChange,
    handleKeyDown,
    handleSuggestionSelect,
    closeSuggestions,
  } = useInterpolationInput({
    value: jsonDraftValue,
    availableVariables: supportsInterpolation ? availableVariables : [],
    onChange: (nextRawValue) => {
      applyJsonDraftChange(
        nextRawValue,
        fieldKey,
        selectedFieldId,
        setJsonDraftByFieldId,
        setJsonErrorByFieldId,
        updateSelectedStep,
        supportsInterpolation,
      );
    },
  });

  return (
    <label className="field-block">
      {label}
      <FieldHint hint={hint} example={example} />
      <div className="interpolated-string-field">
        <textarea
          ref={textareaRef}
          value={jsonDraftValue}
          onChange={(event) => {
            const nextRawValue = event.target.value;
            if (supportsInterpolation) {
              handleInputChange(
                nextRawValue,
                event.target.selectionStart ?? nextRawValue.length,
              );
              return;
            }

            applyJsonDraftChange(
              nextRawValue,
              fieldKey,
              selectedFieldId,
              setJsonDraftByFieldId,
              setJsonErrorByFieldId,
              updateSelectedStep,
            );
          }}
          onKeyDown={(event) => {
            if (supportsInterpolation) {
              handleKeyDown(event);
            }
          }}
          onBlur={() => {
            if (supportsInterpolation) {
              closeSuggestions();
            }
          }}
        />
        {supportsInterpolation && suggestionsOpen ? (
          <InterpolationSuggestionsList
            suggestions={filteredSuggestions}
            highlightedIndex={highlightedSuggestionIndex}
            onSelect={(variableName) => {
              if (textareaRef.current) {
                handleSuggestionSelect(variableName, textareaRef.current);
              }
            }}
          />
        ) : null}
      </div>
      {jsonErrorMessage ? (
        <span className="json-field-error">{jsonErrorMessage}</span>
      ) : null}
    </label>
  );
}
