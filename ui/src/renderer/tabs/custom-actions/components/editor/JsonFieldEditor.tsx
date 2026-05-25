import type { Dispatch, SetStateAction } from "react";
import type { StepUpdater } from "../../types";

interface JsonFieldEditorProps {
  fieldKey: string;
  jsonDraftByFieldId: Record<string, string>;
  jsonErrorByFieldId: Record<string, string>;
  label: string;
  selectedFieldId: string;
  value: unknown;
  setJsonDraftByFieldId: Dispatch<SetStateAction<Record<string, string>>>;
  setJsonErrorByFieldId: Dispatch<SetStateAction<Record<string, string>>>;
  updateSelectedStep: (updater: StepUpdater) => void;
}

export function JsonFieldEditor({
  fieldKey,
  jsonDraftByFieldId,
  jsonErrorByFieldId,
  label,
  selectedFieldId,
  value,
  setJsonDraftByFieldId,
  setJsonErrorByFieldId,
  updateSelectedStep,
}: JsonFieldEditorProps): JSX.Element {
  const nextJsonValue = value === undefined ? "" : JSON.stringify(value, null, 2);
  const jsonDraftValue = jsonDraftByFieldId[selectedFieldId] ?? nextJsonValue;
  const jsonErrorMessage = jsonErrorByFieldId[selectedFieldId];

  return (
    <label className="field-block">
      {label}
      <textarea
        value={jsonDraftValue}
        onChange={(event) => {
          const nextRawValue = event.target.value;
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
            setJsonErrorByFieldId((previousErrorByFieldId) => ({
              ...previousErrorByFieldId,
              [selectedFieldId]: "Invalid JSON format.",
            }));
          }
        }}
      />
      {jsonErrorMessage ? (
        <span className="json-field-error">{jsonErrorMessage}</span>
      ) : null}
    </label>
  );
}
