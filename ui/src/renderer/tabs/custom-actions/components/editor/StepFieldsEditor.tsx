import type { Dispatch, SetStateAction } from "react";
import { SUPPORTED_ACTION_TYPES } from "../../constants";
import type { ActionConfig, ActionStep } from "../../../../../shared/types";
import type { StepUpdater } from "../../types";
import { updateStepValue } from "../../utils/stepUtils";
import { formatActionTypeLabel } from "../../utils/formatActionTypeLabel";
import { FieldHint } from "./FieldHint";
import { FieldSelect } from "./FieldSelect";
import { InterpolatedStringField } from "./InterpolatedStringField";
import { JsonFieldEditor } from "./JsonFieldEditor";
import { ObjectFieldEditor } from "./ObjectFieldEditor";
import { StringArrayFieldEditor } from "./StringArrayFieldEditor";
import { XorModeSelector } from "./XorModeSelector";
import { IfElseConditionEditor } from "./IfElseConditionEditor";
import { InvokeActionArgsEditor } from "./InvokeActionArgsEditor";
import { getFieldDefinitions } from "./stepFieldDefinitions";
import type { FlowValidationSeverity } from "../../utils/flowValidationUtils";
import { getFieldBlockClassName } from "../../utils/flowValidationUtils";

function fieldBlockClassName(
  fieldValidationByKey: Map<string, FlowValidationSeverity>,
  fieldKey: string,
): string {
  return getFieldBlockClassName("field-block", fieldValidationByKey.get(fieldKey));
}

const FOR_EACH_MODES = [
  { key: "list", label: "Iterate over list" },
  { key: "count", label: "Repeat N times" },
] as const;

const SHELL_MODES = [
  { key: "command", label: "Single command" },
  { key: "commands", label: "Multiple commands" },
] as const;

interface StepFieldsEditorProps {
  actionRunner: Record<string, ActionConfig>;
  changeSelectedStepAction: (nextActionType: string) => void;
  configuredActionNames: string[];
  contextVariables: string[];
  fieldValidationByKey: Map<string, FlowValidationSeverity>;
  jsonDraftByFieldId: Record<string, string>;
  jsonErrorByFieldId: Record<string, string>;
  selectedStep: ActionStep;
  /** Stable string key for the selected step, used to namespace JSON field draft IDs. */
  selectedStepPathKey: string;
  setJsonDraftByFieldId: Dispatch<SetStateAction<Record<string, string>>>;
  setJsonErrorByFieldId: Dispatch<SetStateAction<Record<string, string>>>;
  updateSelectedStep: (updater: StepUpdater) => void;
}

export function StepFieldsEditor({
  actionRunner,
  changeSelectedStepAction,
  configuredActionNames,
  contextVariables,
  fieldValidationByKey,
  jsonDraftByFieldId,
  jsonErrorByFieldId,
  selectedStep,
  selectedStepPathKey,
  setJsonDraftByFieldId,
  setJsonErrorByFieldId,
  updateSelectedStep,
}: StepFieldsEditorProps): JSX.Element {
  const allFieldDefinitions = getFieldDefinitions(selectedStep);

  const handleForEachModeSelect = (selectedKey: string): void => {
    updateSelectedStep((draft) => {
      const next = { ...draft };
      if (selectedKey === "count") {
        delete next.list;
        if (next.count === undefined) {
          next.count = 1;
        }
      } else {
        delete next.count;
        if (!Array.isArray(next.list)) {
          next.list = [];
        }
      }
      return next;
    });
  };

  const handleShellModeSelect = (selectedKey: string): void => {
    updateSelectedStep((draft) => {
      const next = { ...draft };
      if (selectedKey === "commands") {
        delete next.command;
        if (!Array.isArray(next.commands)) {
          next.commands = [];
        }
      } else {
        delete next.commands;
        if (typeof next.command !== "string") {
          next.command = "";
        }
      }
      return next;
    });
  };

  return (
    <>
      <label className="field-block">
        Step action
        <FieldSelect
          value={selectedStep.action}
          onChange={(event) => changeSelectedStepAction(event.target.value)}
        >
          {SUPPORTED_ACTION_TYPES.map((actionType) => (
            <option key={actionType} value={actionType}>
              {formatActionTypeLabel(actionType)}
            </option>
          ))}
        </FieldSelect>
      </label>

      {selectedStep.action === "forEach" && (
        <XorModeSelector
          label="Iteration mode"
          options={FOR_EACH_MODES}
          activeKey={selectedStep.count !== undefined ? "count" : "list"}
          onSelect={handleForEachModeSelect}
        />
      )}

      {selectedStep.action === "shell" && (
        <XorModeSelector
          label="Command mode"
          options={SHELL_MODES}
          activeKey={selectedStep.commands !== undefined ? "commands" : "command"}
          onSelect={handleShellModeSelect}
        />
      )}

      {selectedStep.action === "ifElse" && (
        <IfElseConditionEditor
          availableVariables={contextVariables}
          fieldValidationByKey={fieldValidationByKey}
          selectedStep={selectedStep}
          updateSelectedStep={updateSelectedStep}
        />
      )}

      {allFieldDefinitions.map((fieldDefinition) => {
        const fieldValue = selectedStep[fieldDefinition.key];
        const selectedFieldId = `${selectedStepPathKey}:${fieldDefinition.key}`;

        if (fieldDefinition.type === "boolean") {
          return (
            <label key={fieldDefinition.key} className={fieldBlockClassName(fieldValidationByKey, fieldDefinition.key)}>
              {fieldDefinition.label}
              <FieldHint hint={fieldDefinition.hint} example={fieldDefinition.example} />
              <FieldSelect
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
              </FieldSelect>
            </label>
          );
        }

        if (fieldDefinition.type === "stringArray") {
          return (
            <StringArrayFieldEditor
              key={fieldDefinition.key}
              availableVariables={contextVariables}
              fieldKey={fieldDefinition.key}
              hint={fieldDefinition.hint}
              example={fieldDefinition.example}
              label={fieldDefinition.label}
              supportsInterpolation={fieldDefinition.supportsInterpolation === true}
              value={fieldValue}
              updateSelectedStep={updateSelectedStep}
            />
          );
        }

        if (
          selectedStep.action === "invokeAction" &&
          fieldDefinition.key === "args"
        ) {
          return (
            <InvokeActionArgsEditor
              key={fieldDefinition.key}
              actionRunner={actionRunner}
              availableVariables={contextVariables}
              fieldValidationByKey={fieldValidationByKey}
              invokedActionName={String(selectedStep.name ?? "")}
              value={fieldValue}
              updateSelectedStep={updateSelectedStep}
            />
          );
        }

        if (fieldDefinition.type === "object") {
          return (
            <ObjectFieldEditor
              key={fieldDefinition.key}
              availableVariables={contextVariables}
              fieldKey={fieldDefinition.key}
              hint={fieldDefinition.hint}
              example={fieldDefinition.example}
              label={fieldDefinition.label}
              validationSeverity={fieldValidationByKey.get(fieldDefinition.key)}
              value={fieldValue}
              updateSelectedStep={updateSelectedStep}
            />
          );
        }

        if (fieldDefinition.type === "json") {
          return (
            <JsonFieldEditor
              key={fieldDefinition.key}
              availableVariables={contextVariables}
              fieldKey={fieldDefinition.key}
              hint={fieldDefinition.hint}
              example={fieldDefinition.example}
              jsonDraftByFieldId={jsonDraftByFieldId}
              jsonErrorByFieldId={jsonErrorByFieldId}
              label={fieldDefinition.label}
              selectedFieldId={selectedFieldId}
              supportsInterpolation={fieldDefinition.supportsInterpolation === true}
              value={fieldValue}
              setJsonDraftByFieldId={setJsonDraftByFieldId}
              setJsonErrorByFieldId={setJsonErrorByFieldId}
              updateSelectedStep={updateSelectedStep}
            />
          );
        }

        const isInvokeActionNameField =
          selectedStep.action === "invokeAction" && fieldDefinition.key === "name";

        if (fieldDefinition.type === "select" || isInvokeActionNameField) {
          const selectOptions = isInvokeActionNameField
            ? configuredActionNames
            : fieldDefinition.options ?? [];
          const currentValue = String(fieldValue ?? "");
          const hasCurrentValueOption =
            currentValue.length > 0 && !selectOptions.includes(currentValue);

          return (
            <label key={fieldDefinition.key} className={fieldBlockClassName(fieldValidationByKey, fieldDefinition.key)}>
              {fieldDefinition.label}
              <FieldHint hint={fieldDefinition.hint} example={fieldDefinition.example} />
              <FieldSelect
                value={currentValue}
                onChange={(event) =>
                  updateSelectedStep((stepDraft) =>
                    updateStepValue(
                      stepDraft,
                      fieldDefinition.key,
                      isInvokeActionNameField ? "string" : fieldDefinition.type,
                      event.target.value,
                    ),
                  )
                }
              >
                {isInvokeActionNameField ? <option value="">Select action…</option> : null}
                {hasCurrentValueOption ? (
                  <option value={currentValue}>{currentValue}</option>
                ) : null}
                {selectOptions.map((optionValue) => (
                  <option key={optionValue} value={optionValue}>
                    {optionValue}
                  </option>
                ))}
              </FieldSelect>
            </label>
          );
        }

        if (fieldDefinition.supportsInterpolation && fieldDefinition.type === "string") {
          return (
            <label key={fieldDefinition.key} className={fieldBlockClassName(fieldValidationByKey, fieldDefinition.key)}>
              {fieldDefinition.label}
              <FieldHint hint={fieldDefinition.hint} example={fieldDefinition.example} />
              <InterpolatedStringField
                value={String(fieldValue ?? "")}
                availableVariables={contextVariables}
                onChange={(nextValue) =>
                  updateSelectedStep((stepDraft) =>
                    updateStepValue(stepDraft, fieldDefinition.key, fieldDefinition.type, nextValue),
                  )
                }
              />
            </label>
          );
        }

        return (
          <label key={fieldDefinition.key} className={fieldBlockClassName(fieldValidationByKey, fieldDefinition.key)}>
            {fieldDefinition.label}
            <FieldHint hint={fieldDefinition.hint} example={fieldDefinition.example} />
            <input
              value={String(fieldValue ?? "")}
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
    </>
  );
}
