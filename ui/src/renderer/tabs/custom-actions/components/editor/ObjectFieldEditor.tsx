import type { ActionStep } from "../../../../../shared/types";
import type { StepUpdater } from "../../types";
import { isRecord, parseLooseValue } from "../../utils/stepUtils";

interface ObjectFieldEditorProps {
  fieldKey: string;
  label: string;
  value: unknown;
  updateSelectedStep: (updater: StepUpdater) => void;
}

export function ObjectFieldEditor({
  fieldKey,
  label,
  value,
  updateSelectedStep,
}: ObjectFieldEditorProps): JSX.Element {
  const objectValue = isRecord(value) ? value : {};
  const objectEntries = Object.entries(objectValue);

  const getObjectFromDraft = (stepDraft: ActionStep): Record<string, unknown> =>
    isRecord(stepDraft[fieldKey]) ? stepDraft[fieldKey] : {};

  return (
    <div className="field-block">
      <span>{label}</span>
      <div className="object-editor">
        {objectEntries.map(([entryKey, entryValue], entryIndex) => (
          <div key={`${fieldKey}-${entryIndex}`} className="object-editor-row">
            <input
              value={entryKey}
              placeholder="key"
              onChange={(event) =>
                updateSelectedStep((stepDraft) => {
                  const previousEntries = Object.entries(getObjectFromDraft(stepDraft));
                  const nextObject: Record<string, unknown> = {};
                  previousEntries.forEach(([rawKey, rawValue], index) => {
                    const nextKey = index === entryIndex ? event.target.value.trim() : rawKey;
                    if (nextKey.length === 0) {
                      return;
                    }
                    nextObject[nextKey] = rawValue;
                  });
                  return { ...stepDraft, [fieldKey]: nextObject };
                })
              }
            />
            <input
              value={
                typeof entryValue === "string" ? entryValue : JSON.stringify(entryValue)
              }
              placeholder="value"
              onChange={(event) =>
                updateSelectedStep((stepDraft) => {
                  const previousEntries = Object.entries(getObjectFromDraft(stepDraft));
                  const nextObject: Record<string, unknown> = {};
                  previousEntries.forEach(([rawKey, rawValue], index) => {
                    if (index === entryIndex) {
                      nextObject[rawKey] = parseLooseValue(event.target.value);
                      return;
                    }
                    nextObject[rawKey] = rawValue;
                  });
                  return { ...stepDraft, [fieldKey]: nextObject };
                })
              }
            />
            <button
              type="button"
              className="button button-red"
              onClick={() =>
                updateSelectedStep((stepDraft) => {
                  const nextObject = Object.fromEntries(
                    Object.entries(getObjectFromDraft(stepDraft)).filter(
                      (_entry, index) => index !== entryIndex,
                    ),
                  );
                  return { ...stepDraft, [fieldKey]: nextObject };
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
            updateSelectedStep((stepDraft) => {
              const previousObject = getObjectFromDraft(stepDraft);
              return {
                ...stepDraft,
                [fieldKey]: {
                  ...previousObject,
                  [`newKey${Object.keys(previousObject).length + 1}`]: "",
                },
              };
            })
          }
        >
          Add Entry
        </button>
      </div>
    </div>
  );
}
