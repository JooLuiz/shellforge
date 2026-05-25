import { STEP_FIELD_DEFINITIONS } from "../../constants";
import type { StepFieldDefinition } from "../../types";
import type { ActionStep } from "../../../../../shared/types";

export function getFieldDefinitions(step: ActionStep): StepFieldDefinition[] {
  const knownFieldDefinitions = STEP_FIELD_DEFINITIONS[step.action] ?? [];
  const knownFieldKeys = new Set(knownFieldDefinitions.map((field) => field.key));
  const unknownFieldDefinitions: StepFieldDefinition[] = Object.keys(step)
    .filter((fieldKey) => fieldKey !== "action" && !knownFieldKeys.has(fieldKey))
    .map((fieldKey) => ({
      key: fieldKey,
      label: `${fieldKey} (JSON)`,
      type: "json",
    }));
  return [...knownFieldDefinitions, ...unknownFieldDefinitions];
}
