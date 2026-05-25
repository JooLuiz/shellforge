import type { ActionStep } from "../../../../../shared/types";
import type { StepUpdater } from "../../types";

interface StringArrayFieldEditorProps {
  fieldKey: string;
  label: string;
  value: unknown;
  updateSelectedStep: (updater: StepUpdater) => void;
}

export function StringArrayFieldEditor({
  fieldKey,
  label,
  value,
  updateSelectedStep,
}: StringArrayFieldEditorProps): JSX.Element {
  const arrayValue = Array.isArray(value) ? value.map((entry) => String(entry)) : [];

  const getArrayFromDraft = (stepDraft: ActionStep): string[] =>
    Array.isArray(stepDraft[fieldKey])
      ? stepDraft[fieldKey].map((entry) => String(entry))
      : [];

  return (
    <div className="field-block">
      <span>{label}</span>
      <div className="list-editor">
        {arrayValue.map((entryValue, entryIndex) => (
          <div key={`${fieldKey}-${entryIndex}`} className="list-editor-row">
            <input
              value={entryValue}
              onChange={(event) =>
                updateSelectedStep((stepDraft) => {
                  const nextArray = [...getArrayFromDraft(stepDraft)];
                  nextArray[entryIndex] = event.target.value;
                  return { ...stepDraft, [fieldKey]: nextArray };
                })
              }
            />
            <button
              type="button"
              className="button button-red"
              onClick={() =>
                updateSelectedStep((stepDraft) => {
                  const nextArray = getArrayFromDraft(stepDraft).filter(
                    (_entry, index) => index !== entryIndex,
                  );
                  return { ...stepDraft, [fieldKey]: nextArray };
                })
              }
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="button button-blue"
          onClick={() =>
            updateSelectedStep((stepDraft) => ({
              ...stepDraft,
              [fieldKey]: [...getArrayFromDraft(stepDraft), ""],
            }))
          }
        >
          Add Item
        </button>
      </div>
    </div>
  );
}
