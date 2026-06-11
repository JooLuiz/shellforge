import type { ActionStep } from "../../../../shared/types";
import { BROWSER_STEP_ACTION_SET } from "../constants";
import { isActionStep } from "./stepUtils";

const NESTED_STEP_ARRAY_KEYS = ["steps", "try", "catch", "finally", "then", "else"] as const;

function stepUsesBrowser(step: ActionStep): boolean {
  return BROWSER_STEP_ACTION_SET.has(step.action);
}

function nestedStepsUseBrowser(steps: ActionStep[]): boolean {
  return steps.some((step) => stepTreeUsesBrowser(step));
}

function stepTreeUsesBrowser(step: ActionStep): boolean {
  if (stepUsesBrowser(step)) {
    return true;
  }

  return NESTED_STEP_ARRAY_KEYS.some((nestedKey) => {
    const nestedValue = step[nestedKey];
    if (!Array.isArray(nestedValue)) {
      return false;
    }
    const nestedSteps = nestedValue.filter(isActionStep);
    return nestedStepsUseBrowser(nestedSteps);
  });
}

export function actionUsesBrowserSteps(steps: ActionStep[]): boolean {
  return nestedStepsUseBrowser(steps);
}
