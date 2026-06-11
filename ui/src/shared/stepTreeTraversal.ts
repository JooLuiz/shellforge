import type { ActionStep, StepPath } from "./types";

export const NESTED_STEP_ARRAY_KEYS = [
  "steps",
  "try",
  "catch",
  "finally",
  "then",
  "else",
] as const;

export type NestedStepArrayKey = (typeof NESTED_STEP_ARRAY_KEYS)[number];

export const NESTED_STEP_ARRAY_KEY_SET = new Set<string>(NESTED_STEP_ARRAY_KEYS);

export interface StepWithPath {
  step: ActionStep;
  path: StepPath;
}

export function isActionStep(value: unknown): value is ActionStep {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return typeof (value as { action?: unknown }).action === "string";
}

export function filterActionSteps(values: unknown[]): ActionStep[] {
  return values.filter(isActionStep);
}

export function collectStepsWithPaths(
  steps: ActionStep[],
  parentPath: StepPath,
  arrayKey: string,
): StepWithPath[] {
  const collected: StepWithPath[] = [];

  steps.forEach((step, stepIndex) => {
    const currentPath: StepPath = [...parentPath, { arrayKey, stepIndex }];
    collected.push({ step, path: currentPath });

    NESTED_STEP_ARRAY_KEYS.forEach((nestedKey) => {
      const nestedValue = step[nestedKey];
      if (!Array.isArray(nestedValue)) {
        return;
      }

      const nestedSteps = filterActionSteps(nestedValue);
      collected.push(...collectStepsWithPaths(nestedSteps, currentPath, nestedKey));
    });
  });

  return collected;
}

export function forEachNestedStepArray(
  step: ActionStep,
  callback: (nestedKey: NestedStepArrayKey, nestedSteps: ActionStep[]) => void,
): void {
  NESTED_STEP_ARRAY_KEYS.forEach((nestedKey) => {
    const nestedValue = step[nestedKey];
    if (!Array.isArray(nestedValue)) {
      return;
    }

    callback(nestedKey, filterActionSteps(nestedValue));
  });
}
