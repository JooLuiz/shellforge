import { STEP_FIELD_DEFINITIONS } from "../../constants";
import type { StepFieldDefinition } from "../../types";
import type { ActionStep } from "../../../../../shared/types";

/**
 * Keys that hold nested step arrays managed exclusively by the visual flow.
 * They are never shown as editable fields in the detail panel.
 */
const VISUAL_FLOW_ONLY_KEYS = new Set(["steps", "try", "catch", "finally", "then", "else"]);
const IF_ELSE_CONDITION_KEYS = new Set(["left", "operator", "right"]);

function isHiddenStepKey(step: ActionStep, fieldKey: string): boolean {
  if (VISUAL_FLOW_ONLY_KEYS.has(fieldKey)) {
    return true;
  }

  if (step.action === "ifElse" && IF_ELSE_CONDITION_KEYS.has(fieldKey)) {
    return true;
  }

  return false;
}

export function getFieldDefinitions(step: ActionStep): StepFieldDefinition[] {
  const knownFieldDefinitions = (STEP_FIELD_DEFINITIONS[step.action] ?? []).filter(
    (field) => !field.visibleWhen || field.visibleWhen(step),
  );
  const knownFieldKeys = new Set(knownFieldDefinitions.map((field) => field.key));
  const unknownFieldDefinitions: StepFieldDefinition[] = Object.keys(step)
    .filter(
      (fieldKey) =>
        fieldKey !== "action" &&
        !knownFieldKeys.has(fieldKey) &&
        !isHiddenStepKey(step, fieldKey),
    )
    .map((fieldKey) => ({
      key: fieldKey,
      label: `${fieldKey} (JSON)`,
      type: "json",
    }));
  return [...knownFieldDefinitions, ...unknownFieldDefinitions];
}
