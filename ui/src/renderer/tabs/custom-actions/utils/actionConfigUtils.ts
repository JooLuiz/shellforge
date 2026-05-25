import type { ActionConfig, ActionStep } from "../../../../shared/types";
import type { ActionEditorDraft } from "../types";
import { cloneActionConfig, getActionSteps, isActionStep } from "./stepUtils";

export function serializeEditorDraft(draft: ActionEditorDraft): string {
  return JSON.stringify(draft);
}

function mapStepsRecursively(
  steps: ActionStep[],
  mapper: (step: ActionStep) => ActionStep,
): ActionStep[] {
  return steps.map((step) => {
    let mappedStep = mapper({ ...step });
    const nestedStepKeys = ["steps", "try", "catch", "finally"];
    nestedStepKeys.forEach((nestedKey) => {
      const nestedValue = mappedStep[nestedKey];
      if (!Array.isArray(nestedValue)) {
        return;
      }
      const typedNestedSteps = nestedValue.filter(isActionStep);
      mappedStep = {
        ...mappedStep,
        [nestedKey]: mapStepsRecursively(typedNestedSteps, mapper),
      };
    });
    return mappedStep;
  });
}

export function renameInvokeActionReferencesInConfig(
  actionConfig: ActionConfig,
  previousActionName: string,
  nextActionName: string,
): ActionConfig {
  const actionSteps = getActionSteps(actionConfig);
  return {
    ...cloneActionConfig(actionConfig),
    steps: mapStepsRecursively(actionSteps, (step) => {
      if (step.action === "invokeAction" && step.name === previousActionName) {
        return { ...step, name: nextActionName };
      }
      return step;
    }),
  };
}

export function collectRequiredArgs(actionConfig: ActionConfig): string[] {
  const requiredArgs = new Set<string>();
  const inspectSteps = (steps: ActionStep[]): void => {
    steps.forEach((step) => {
      if (step.action === "getArguments" && Array.isArray(step.required)) {
        step.required
          .filter((requiredArg) => typeof requiredArg === "string")
          .forEach((requiredArg) => requiredArgs.add(requiredArg));
      }
      ["steps", "try", "catch", "finally"].forEach((nestedKey) => {
        const nestedValue = step[nestedKey];
        if (!Array.isArray(nestedValue)) {
          return;
        }
        const nestedSteps = nestedValue.filter(isActionStep);
        inspectSteps(nestedSteps);
      });
    });
  };

  inspectSteps(getActionSteps(actionConfig));
  return Array.from(requiredArgs);
}
