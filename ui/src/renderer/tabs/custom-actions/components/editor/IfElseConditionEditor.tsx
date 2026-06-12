import type { ActionStep } from "../../../../../shared/types";
import type { StepUpdater } from "../../types";
import type { FlowValidationSeverity } from "../../utils/flowValidationUtils";
import { getFieldBlockClassName } from "../../utils/flowValidationUtils";
import {
  IF_ELSE_OPERATOR_LABELS,
  IF_ELSE_OPERATORS,
  isIfElseOperator,
} from "../../utils/ifElseOperators";
import { FieldHint } from "./FieldHint";
import { FieldSelect } from "./FieldSelect";
import { InterpolatedStringField } from "./InterpolatedStringField";

interface IfElseConditionEditorProps {
  availableVariables: readonly string[];
  fieldValidationByKey: Map<string, FlowValidationSeverity>;
  selectedStep: ActionStep;
  updateSelectedStep: (updater: StepUpdater) => void;
}

export function IfElseConditionEditor({
  availableVariables,
  fieldValidationByKey,
  selectedStep,
  updateSelectedStep,
}: IfElseConditionEditorProps): JSX.Element {
  const leftValue = String(selectedStep.left ?? "");
  const operatorValue = isIfElseOperator(String(selectedStep.operator ?? ""))
    ? selectedStep.operator
    : "eq";
  const rightValue = String(selectedStep.right ?? "");
  const showRightOperand = operatorValue !== "exists";

  return (
    <>
      <label className={getFieldBlockClassName("field-block", fieldValidationByKey.get("left"))}>
        Compare value
        <FieldHint
          hint="Runtime value to compare — must be a single {{context.*}} or {{env.*}} placeholder"
          example="{{context.retries}}"
        />
        <InterpolatedStringField
          value={leftValue}
          availableVariables={availableVariables}
          placeholder="{{context.variableName}}"
          onChange={(nextValue) =>
            updateSelectedStep((stepDraft) => ({ ...stepDraft, left: nextValue }))
          }
        />
      </label>

      <label className={getFieldBlockClassName("field-block", fieldValidationByKey.get("operator"))}>
        Operator
        <FieldSelect
          value={operatorValue}
          onChange={(event) => {
            const nextOperator = event.target.value;
            updateSelectedStep((stepDraft) => {
              const nextStep = { ...stepDraft, operator: nextOperator };
              if (nextOperator === "exists") {
                delete nextStep.right;
              } else if (typeof nextStep.right !== "string") {
                nextStep.right = "";
              }
              return nextStep;
            });
          }}
        >
          {IF_ELSE_OPERATORS.map((operator) => (
            <option key={operator} value={operator}>
              {IF_ELSE_OPERATOR_LABELS[operator]}
            </option>
          ))}
        </FieldSelect>
      </label>

      {showRightOperand ? (
        <label className={getFieldBlockClassName("field-block", fieldValidationByKey.get("right"))}>
          Compare against
          <FieldHint
            hint="Second value for the comparison — supports context and env interpolation"
            example="3"
          />
          <InterpolatedStringField
            value={rightValue}
            availableVariables={availableVariables}
            onChange={(nextValue) =>
              updateSelectedStep((stepDraft) => ({ ...stepDraft, right: nextValue }))
            }
          />
        </label>
      ) : null}
    </>
  );
}
