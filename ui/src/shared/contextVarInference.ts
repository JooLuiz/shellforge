import type { ActionStep, StepPath } from "./types";

interface BlockScope {
  includeItemIndex: boolean;
  includeErrorMessage: boolean;
}

const EMPTY_BLOCK_SCOPE: BlockScope = {
  includeItemIndex: false,
  includeErrorMessage: false,
};

function stepPathToKey(path: StepPath): string {
  return path.map((segment) => `${segment.arrayKey}.${segment.stepIndex}`).join("/");
}

function pathsEqual(firstPath: StepPath, secondPath: StepPath): boolean {
  return stepPathToKey(firstPath) === stepPathToKey(secondPath);
}

function isStrictPrefixPath(prefixPath: StepPath, fullPath: StepPath): boolean {
  if (prefixPath.length >= fullPath.length) {
    return false;
  }

  return stepPathToKey(fullPath).startsWith(`${stepPathToKey(prefixPath)}/`);
}

function getSubSteps(step: ActionStep, arrayKey: string): ActionStep[] {
  const value = step[arrayKey];
  return Array.isArray(value) ? (value as ActionStep[]) : [];
}

function collectVariablesProducedByStepBase(step: ActionStep): string[] {
  const producedVariables: string[] = [];

  if (typeof step.storeAs === "string" && step.storeAs.trim().length > 0) {
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
        producedVariables.push(entry),
      );
    }
  }

  return Array.from(new Set(producedVariables));
}

function applyBlockScopeVariables(variables: Set<string>, scope: BlockScope): void {
  if (scope.includeItemIndex) {
    variables.add("item");
    variables.add("index");
  }

  if (scope.includeErrorMessage) {
    variables.add("errorMessage");
  }
}

function addStepVariables(variables: Set<string>, step: ActionStep): void {
  collectVariablesProducedByStepBase(step).forEach((variableName) => {
    variables.add(variableName);
  });
}

function getNestedLaneKey(targetPath: StepPath, parentPathLength: number): string | null {
  if (targetPath.length <= parentPathLength) {
    return null;
  }

  return targetPath[parentPathLength].arrayKey;
}

function walkSequentialSteps(
  steps: ActionStep[],
  parentPath: StepPath,
  arrayKey: string,
  targetPath: StepPath,
  variables: Set<string>,
  scope: BlockScope,
): boolean {
  applyBlockScopeVariables(variables, scope);

  for (let stepIndex = 0; stepIndex < steps.length; stepIndex += 1) {
    const step = steps[stepIndex];
    const currentPath: StepPath = [...parentPath, { arrayKey, stepIndex }];

    if (pathsEqual(currentPath, targetPath)) {
      return true;
    }

    addStepVariables(variables, step);

    if (isStrictPrefixPath(currentPath, targetPath)) {
      const reachedTarget = walkIntoBlockStep(step, currentPath, targetPath, variables);
      if (reachedTarget) {
        return true;
      }
    }
  }

  return false;
}

function walkTryCatchBlock(
  blockStep: ActionStep,
  blockPath: StepPath,
  targetPath: StepPath,
  variables: Set<string>,
): boolean {
  const nestedLaneKey = getNestedLaneKey(targetPath, blockPath.length);
  const trySteps = getSubSteps(blockStep, "try");
  const catchSteps = getSubSteps(blockStep, "catch");
  const finallySteps = getSubSteps(blockStep, "finally");

  if (nestedLaneKey === "try") {
    return walkSequentialSteps(trySteps, blockPath, "try", targetPath, variables, EMPTY_BLOCK_SCOPE);
  }

  if (nestedLaneKey === "catch") {
    walkSequentialSteps(trySteps, blockPath, "try", targetPath, variables, EMPTY_BLOCK_SCOPE);
    return walkSequentialSteps(catchSteps, blockPath, "catch", targetPath, variables, {
      includeItemIndex: false,
      includeErrorMessage: true,
    });
  }

  if (nestedLaneKey === "finally") {
    walkSequentialSteps(trySteps, blockPath, "try", targetPath, variables, EMPTY_BLOCK_SCOPE);

    if (catchSteps.length > 0) {
      walkSequentialSteps(catchSteps, blockPath, "catch", targetPath, variables, {
        includeItemIndex: false,
        includeErrorMessage: true,
      });
    }

    return walkSequentialSteps(finallySteps, blockPath, "finally", targetPath, variables, {
      includeItemIndex: false,
      includeErrorMessage: true,
    });
  }

  return false;
}

function walkIfElseBlock(
  blockStep: ActionStep,
  blockPath: StepPath,
  targetPath: StepPath,
  variables: Set<string>,
): boolean {
  const nestedLaneKey = getNestedLaneKey(targetPath, blockPath.length);
  const thenSteps = getSubSteps(blockStep, "then");
  const elseSteps = getSubSteps(blockStep, "else");

  if (nestedLaneKey === "then") {
    return walkSequentialSteps(thenSteps, blockPath, "then", targetPath, variables, EMPTY_BLOCK_SCOPE);
  }

  if (nestedLaneKey === "else") {
    return walkSequentialSteps(elseSteps, blockPath, "else", targetPath, variables, EMPTY_BLOCK_SCOPE);
  }

  return false;
}

function walkIntoBlockStep(
  blockStep: ActionStep,
  blockPath: StepPath,
  targetPath: StepPath,
  variables: Set<string>,
): boolean {
  if (blockStep.action === "forEach" || blockStep.action === "forEachElement") {
    return walkSequentialSteps(
      getSubSteps(blockStep, "steps"),
      blockPath,
      "steps",
      targetPath,
      variables,
      { includeItemIndex: true, includeErrorMessage: false },
    );
  }

  if (blockStep.action === "tryCatch") {
    return walkTryCatchBlock(blockStep, blockPath, targetPath, variables);
  }

  if (blockStep.action === "ifElse") {
    return walkIfElseBlock(blockStep, blockPath, targetPath, variables);
  }

  return false;
}

export function inferContextVariablesBeforeStep(
  rootSteps: ActionStep[],
  targetPath: StepPath | null,
): string[] {
  if (!targetPath || targetPath.length === 0) {
    return [];
  }

  const variables = new Set<string>();
  walkSequentialSteps(rootSteps, [], "steps", targetPath, variables, EMPTY_BLOCK_SCOPE);
  return Array.from(variables);
}
