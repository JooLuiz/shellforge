import type { ActionConfig, ActionStep } from "./types";

export interface ActionArgumentSchema {
  required: string[];
  optional: string[];
  defaults: Record<string, string>;
}

const NESTED_STEP_KEYS = ["steps", "try", "catch", "finally", "then", "else"] as const;

function isActionStep(value: unknown): value is ActionStep {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return typeof (value as { action?: unknown }).action === "string";
}

function getActionSteps(actionConfig: ActionConfig): ActionStep[] {
  if (!Array.isArray(actionConfig.steps)) {
    return [];
  }
  return actionConfig.steps.filter(isActionStep);
}

function addDefaults(target: Record<string, string>, value: unknown): void {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return;
  }

  Object.entries(value as Record<string, unknown>).forEach(([key, entryValue]) => {
    if (typeof entryValue === "string" || typeof entryValue === "number" || typeof entryValue === "boolean") {
      target[key] = String(entryValue);
    }
  });
}

function inspectStepsForArgumentSchema(steps: ActionStep[], schema: ActionArgumentSchema): void {
  steps.forEach((step) => {
    if (step.action === "getArguments") {
      step.required
        ?.filter((requiredArg): requiredArg is string => typeof requiredArg === "string")
        .forEach((requiredArg) => {
          if (!schema.required.includes(requiredArg)) {
            schema.required.push(requiredArg);
          }
        });

      step.optional
        ?.filter((optionalArg): optionalArg is string => typeof optionalArg === "string")
        .forEach((optionalArg) => {
          if (!schema.optional.includes(optionalArg) && !schema.required.includes(optionalArg)) {
            schema.optional.push(optionalArg);
          }
        });

      addDefaults(schema.defaults, step.defaults);
    }

    NESTED_STEP_KEYS.forEach((nestedKey) => {
      const nestedValue = step[nestedKey];
      if (!Array.isArray(nestedValue)) {
        return;
      }
      inspectStepsForArgumentSchema(nestedValue.filter(isActionStep), schema);
    });
  });
}

export function collectActionArgumentSchema(actionConfig: ActionConfig): ActionArgumentSchema {
  const schema: ActionArgumentSchema = {
    required: [],
    optional: [],
    defaults: {},
  };

  inspectStepsForArgumentSchema(getActionSteps(actionConfig), schema);
  return schema;
}

export function collectRequiredArgs(actionConfig: ActionConfig): string[] {
  return collectActionArgumentSchema(actionConfig).required;
}
