import type { Dispatch, SetStateAction } from "react";
import { SUPPORTED_ACTION_TYPES } from "../../constants";
import type { ActionStep } from "../../../../../shared/types";
import type { StepUpdater } from "../../types";
import { updateStepValue } from "../../utils/stepUtils";
import { JsonFieldEditor } from "./JsonFieldEditor";
import { ObjectFieldEditor } from "./ObjectFieldEditor";
import { StringArrayFieldEditor } from "./StringArrayFieldEditor";
import { getFieldDefinitions } from "./stepFieldDefinitions";

interface StepFieldsEditorProps {
  changeSelectedStepAction: (nextActionType: string) => void;
  contextVariables: string[];
  jsonDraftByFieldId: Record<string, string>;
  jsonErrorByFieldId: Record<string, string>;
  selectedStep: ActionStep;
  selectedStepIndex: number | null;
  setJsonDraftByFieldId: Dispatch<SetStateAction<Record<string, string>>>;
  setJsonErrorByFieldId: Dispatch<SetStateAction<Record<string, string>>>;
  updateSelectedStep: (updater: StepUpdater) => void;
}

export function StepFieldsEditor({
  changeSelectedStepAction,
  contextVariables,
  jsonDraftByFieldId,
  jsonErrorByFieldId,
  selectedStep,
  selectedStepIndex,
  setJsonDraftByFieldId,
  setJsonErrorByFieldId,
  updateSelectedStep,
}: StepFieldsEditorProps): JSX.Element {
  const allFieldDefinitions = getFieldDefinitions(selectedStep);

  return (
    <>
      <label className="field-block">
        Step action
        <select
          value={selectedStep.action}
          onChange={(event) => changeSelectedStepAction(event.target.value)}
        >
          {SUPPORTED_ACTION_TYPES.map((actionType) => (
            <option key={actionType} value={actionType}>
              {actionType}
            </option>
          ))}
        </select>
      </label>

      {allFieldDefinitions.map((fieldDefinition) => {
        const fieldValue = selectedStep[fieldDefinition.key];
        const selectedFieldId = `${selectedStepIndex ?? "none"}:${fieldDefinition.key}`;

        if (fieldDefinition.type === "boolean") {
          return (
            <label key={fieldDefinition.key} className="field-block">
              {fieldDefinition.label}
              <select
                value={fieldValue === true ? "true" : "false"}
                onChange={(event) =>
                  updateSelectedStep((stepDraft) =>
                    updateStepValue(
                      stepDraft,
                      fieldDefinition.key,
                      fieldDefinition.type,
                      event.target.value,
                    ),
                  )
                }
              >
                <option value="false">false</option>
                <option value="true">true</option>
              </select>
            </label>
          );
        }

        if (fieldDefinition.type === "stringArray") {
          return (
            <StringArrayFieldEditor
              key={fieldDefinition.key}
              fieldKey={fieldDefinition.key}
              label={fieldDefinition.label}
              value={fieldValue}
              updateSelectedStep={updateSelectedStep}
            />
          );
        }

        if (fieldDefinition.type === "object") {
          return (
            <ObjectFieldEditor
              key={fieldDefinition.key}
              fieldKey={fieldDefinition.key}
              label={fieldDefinition.label}
              value={fieldValue}
              updateSelectedStep={updateSelectedStep}
            />
          );
        }

        if (fieldDefinition.type === "json") {
          return (
            <JsonFieldEditor
              key={fieldDefinition.key}
              fieldKey={fieldDefinition.key}
              jsonDraftByFieldId={jsonDraftByFieldId}
              jsonErrorByFieldId={jsonErrorByFieldId}
              label={fieldDefinition.label}
              selectedFieldId={selectedFieldId}
              value={fieldValue}
              setJsonDraftByFieldId={setJsonDraftByFieldId}
              setJsonErrorByFieldId={setJsonErrorByFieldId}
              updateSelectedStep={updateSelectedStep}
            />
          );
        }

        return (
          <label key={fieldDefinition.key} className="field-block">
            {fieldDefinition.label}
            <input
              value={String(fieldValue ?? "")}
              list={fieldDefinition.type === "string" ? "context-variables" : undefined}
              onChange={(event) =>
                updateSelectedStep((stepDraft) =>
                  updateStepValue(
                    stepDraft,
                    fieldDefinition.key,
                    fieldDefinition.type,
                    event.target.value,
                  ),
                )
              }
            />
          </label>
        );
      })}

      <datalist id="context-variables">
        {contextVariables.map((variableName) => (
          <option key={variableName} value={`{{context.${variableName}}}`} />
        ))}
      </datalist>
    </>
  );
}
