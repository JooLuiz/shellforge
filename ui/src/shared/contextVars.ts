import type { ActionStep, ContextValidationWarning, StepPath } from "./types";
import { inferContextVariablesBeforeStep } from "./contextVarInference";
import {
  collectStepsWithPaths,
  NESTED_STEP_ARRAY_KEY_SET,
} from "./stepTreeTraversal";

export { inferContextVariablesBeforeStep } from "./contextVarInference";

const CONTEXT_PLACEHOLDER_REGEX = /\{\{\s*context\.([a-zA-Z0-9_.-]+)\s*\}\}/g;

function flattenStepStringFields(
  input: unknown,
  basePath: string,
  collector: Array<{ path: string; value: string }>,
): void {
  if (typeof input === "string") {
    collector.push({ path: basePath, value: input });
    return;
  }

  if (Array.isArray(input)) {
    input.forEach((entry, index) => {
      flattenStepStringFields(entry, `${basePath}[${index}]`, collector);
    });
    return;
  }

  if (!input || typeof input !== "object") {
    return;
  }

  Object.entries(input as Record<string, unknown>).forEach(([key, value]) => {
    if (NESTED_STEP_ARRAY_KEY_SET.has(key)) {
      return;
    }

    const nextPath = basePath.length > 0 ? `${basePath}.${key}` : key;
    flattenStepStringFields(value, nextPath, collector);
  });
}

function collectVariablesProducedByStep(step: ActionStep): string[] {
  const producedVariables: string[] = [];

  if (typeof step.storeAs === "string" && step.storeAs.trim().length > 0) {
    producedVariables.push(step.storeAs.trim());
  }

  if (step.action === "forEach" || step.action === "forEachElement") {
    producedVariables.push("item");
    producedVariables.push("index");
  }

  if (step.action === "getArguments") {
    if (Array.isArray(step.required)) {
      step.required
        .filter((entry): entry is string => typeof entry === "string")
        .forEach((entry) => producedVariables.push(entry));
    }

    if (Array.isArray(step.optional)) {
      step.optional
        .filter((entry): entry is string => typeof entry === "string")
        .forEach((entry) => producedVariables.push(entry));
    }

    if (step.defaults && typeof step.defaults === "object") {
      Object.keys(step.defaults as Record<string, unknown>).forEach((entry) =>
        producedVariables.push(entry),
      );
    }
  }

  return Array.from(new Set(producedVariables));
}

function collectWarningsForStepAtPath(
  step: ActionStep,
  stepPath: StepPath,
  rootSteps: ActionStep[],
): ContextValidationWarning[] {
  const availableVariables = new Set(inferContextVariablesBeforeStep(rootSteps, stepPath));
  const warnings: ContextValidationWarning[] = [];
  const stringFields: Array<{ path: string; value: string }> = [];
  flattenStepStringFields(step, "", stringFields);

  stringFields.forEach((entry) => {
    const matches = entry.value.matchAll(CONTEXT_PLACEHOLDER_REGEX);
    for (const match of matches) {
      const referencedVariable = match[1];
      const rootVariable = referencedVariable.split(".")[0];
      if (!availableVariables.has(rootVariable)) {
        warnings.push({
          stepPath,
          fieldPath: entry.path,
          variableName: rootVariable,
        });
      }
    }
  });

  return warnings;
}

export function inferContextVariables(steps: ActionStep[]): string[] {
  const availableVariables = new Set<string>();

  collectStepsWithPaths(steps, [], "steps").forEach(({ step }) => {
    collectVariablesProducedByStep(step).forEach((variableName) => {
      availableVariables.add(variableName);
    });
  });

  return Array.from(availableVariables);
}

export function validateContextReferences(steps: ActionStep[]): ContextValidationWarning[] {
  const warnings: ContextValidationWarning[] = [];

  collectStepsWithPaths(steps, [], "steps").forEach(({ step, path }) => {
    collectWarningsForStepAtPath(step, path, steps).forEach((warning) => {
      warnings.push(warning);
    });
  });

  return warnings;
}
