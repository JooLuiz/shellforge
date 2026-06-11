import type { ActionStep } from "../../../../../shared/types";
import type { StepUpdater } from "../../types";
import { FieldHint } from "./FieldHint";
import { InterpolatedStringField } from "./InterpolatedStringField";

interface StringArrayFieldEditorProps {
  availableVariables: readonly string[];
  fieldKey: string;
  hint?: string;
  example?: string;
  label: string;
  supportsInterpolation?: boolean;
  value: unknown;
  updateSelectedStep: (updater: StepUpdater) => void;
}

export function StringArrayFieldEditor({
  availableVariables,
  fieldKey,
  hint,
  example,
  label,
  supportsInterpolation = false,
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
      <FieldHint hint={hint} example={example} />
      <div className="list-editor">
        {arrayValue.map((entryValue, entryIndex) => (
          <div key={`${fieldKey}-${entryIndex}`} className="list-editor-row">
            {supportsInterpolation ? (
              <InterpolatedStringField
                value={entryValue}
                availableVariables={availableVariables}
                onChange={(nextValue) =>
                  updateSelectedStep((stepDraft) => {
                    const nextArray = [...getArrayFromDraft(stepDraft)];
                    nextArray[entryIndex] = nextValue;
                    return { ...stepDraft, [fieldKey]: nextArray };
                  })
                }
              />
            ) : (
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
            )}
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
