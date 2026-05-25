import type { ActionStep, ContextValidationWarning } from "./types";

const CONTEXT_PLACEHOLDER_REGEX = /\{\{\s*context\.([a-zA-Z0-9_.-]+)\s*\}\}/g;

function flattenStringFields(
  input: unknown,
  basePath: string,
  collector: Array<{ path: string; value: string }>
): void {
  if (typeof input === "string") {
    collector.push({ path: basePath, value: input });
    return;
  }

  if (Array.isArray(input)) {
    input.forEach((entry, index) => {
      flattenStringFields(entry, `${basePath}[${index}]`, collector);
    });
    return;
  }

  if (!input || typeof input !== "object") {
    return;
  }

  Object.entries(input as Record<string, unknown>).forEach(([key, value]) => {
    const nextPath = basePath.length > 0 ? `${basePath}.${key}` : key;
    flattenStringFields(value, nextPath, collector);
  });
}

function collectVariablesProducedByStep(step: ActionStep): string[] {
  const producedVariables: string[] = [];

  if (typeof step.storeAs === "string" && step.storeAs.trim().length > 0) {
    producedVariables.push(step.storeAs.trim());
  }

  if (
    step.action === "extractVariable" &&
    typeof step.storeAs === "string" &&
    step.storeAs.trim().length > 0
  ) {
    producedVariables.push(step.storeAs.trim());
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
        producedVariables.push(entry)
      );
    }
  }

  return Array.from(new Set(producedVariables));
}

function collectWarningsForStep(
  step: ActionStep,
  stepIndex: number,
  availableVariables: Set<string>
): ContextValidationWarning[] {
  const warnings: ContextValidationWarning[] = [];
  const stringFields: Array<{ path: string; value: string }> = [];
  flattenStringFields(step, "", stringFields);

  stringFields.forEach((entry) => {
    const matches = entry.value.matchAll(CONTEXT_PLACEHOLDER_REGEX);
    for (const match of matches) {
      const referencedVariable = match[1];
      const rootVariable = referencedVariable.split(".")[0];
      if (!availableVariables.has(rootVariable)) {
        warnings.push({
          stepIndex,
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

  steps.forEach((step) => {
    collectVariablesProducedByStep(step).forEach((variableName) => {
      availableVariables.add(variableName);
    });
  });

  return Array.from(availableVariables);
}

export function validateContextReferences(steps: ActionStep[]): ContextValidationWarning[] {
  const availableVariables = new Set<string>();
  const warnings: ContextValidationWarning[] = [];

  steps.forEach((step, index) => {
    collectWarningsForStep(step, index, availableVariables).forEach((warning) => {
      warnings.push(warning);
    });

    collectVariablesProducedByStep(step).forEach((variableName) => {
      availableVariables.add(variableName);
    });
  });

  return warnings;
}
