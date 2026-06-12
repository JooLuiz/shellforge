import type { ActionStep } from "../../../../shared/types";
import { forEachNestedStepArray } from "../../../../shared/stepTreeTraversal";
import { BROWSER_STEP_ACTION_SET } from "../constants";

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

  let usesBrowser = false;
  forEachNestedStepArray(step, (_nestedKey, nestedSteps) => {
    if (nestedStepsUseBrowser(nestedSteps)) {
      usesBrowser = true;
    }
  });
  return usesBrowser;
}

export function actionUsesBrowserSteps(steps: ActionStep[]): boolean {
  return nestedStepsUseBrowser(steps);
}
