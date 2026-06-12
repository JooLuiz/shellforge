import type { ActionConfig, ActionStep, AppConfig, StepPath } from "../../../../shared/types";
import { STEP_FIELD_DEFINITIONS } from "../constants";
import type { ActionEditorDraft } from "../types";
import { collectRequiredArgs } from "./actionConfigUtils";
import { isValidIfElseLeftOperand } from "./ifElseConditionUtils";
import { IF_ELSE_OPERATORS, isIfElseOperator } from "./ifElseOperators";
import { getStepAtPath } from "./stepPath";
import {
  buildSelfInvocationTokens,
  shellStepInvokesSelf,
} from "./shellSelfInvocationUtils";
import { collectStepsWithPaths } from "../../../../shared/stepTreeTraversal";
import { getActionSteps, isRecord } from "./stepUtils";

export interface ActionEditorValidationIssue {
  stepPath: StepPath;
  fieldKey: string;
  message: string;
}

const IF_ELSE_BRANCH_KEYS = new Set(["then", "else"]);

export function isInsideIfElseBranch(stepPath: StepPath, rootSteps: ActionStep[]): boolean {
  let parentPath: StepPath = [];

  for (const segment of stepPath) {
    if (IF_ELSE_BRANCH_KEYS.has(segment.arrayKey)) {
      const parentStep = getStepAtPath(rootSteps, parentPath);
      if (parentStep?.action === "ifElse") {
        return true;
      }
    }
    parentPath = [...parentPath, segment];
  }

  return false;
}

function resolveShellFieldKey(step: ActionStep): string {
  return step.commands !== undefined ? "commands" : "command";
}

function validateIfElseStep(step: ActionStep, stepPath: StepPath): ActionEditorValidationIssue[] {
  const issues: ActionEditorValidationIssue[] = [];
  const leftOperand = typeof step.left === "string" ? step.left : "";

  if (!isValidIfElseLeftOperand(leftOperand)) {
    issues.push({
      stepPath,
      fieldKey: "left",
      message:
        'ifElse "Compare value" must be a single {{context.*}} or {{env.*}} placeholder.',
    });
  }

  const operator = typeof step.operator === "string" ? step.operator : "";
  if (!isIfElseOperator(operator)) {
    issues.push({
      stepPath,
      fieldKey: "operator",
      message: `ifElse operator must be one of: ${IF_ELSE_OPERATORS.join(", ")}.`,
    });
  } else if (operator !== "exists") {
    const rightOperand = typeof step.right === "string" ? step.right.trim() : "";
    if (rightOperand.length === 0) {
      issues.push({
        stepPath,
        fieldKey: "right",
        message: 'ifElse requires a value in "Compare against" unless operator is "Exists".',
      });
    }
  }

  return issues;
}

function validateObjectFieldEntries(
  step: ActionStep,
  stepPath: StepPath,
  fieldKey: string,
  fieldLabel: string,
): ActionEditorValidationIssue[] {
  const fieldValue = step[fieldKey];
  if (!isRecord(fieldValue)) {
    return [];
  }

  const issues: ActionEditorValidationIssue[] = [];

  Object.entries(fieldValue).forEach(([entryKey, entryValue]) => {
    if (entryKey.trim().length === 0) {
      issues.push({
        stepPath,
        fieldKey,
        message: `${fieldLabel}: object entries must have a non-empty key.`,
      });
      return;
    }

    if (typeof entryValue === "string" && entryValue.trim().length === 0) {
      issues.push({
        stepPath,
        fieldKey,
        message: `${fieldLabel}: entry "${entryKey}" must have a value or be removed.`,
      });
    }
  });

  return issues;
}

function validateInvokeActionArgs(
  step: ActionStep,
  stepPath: StepPath,
  actionRunner: Record<string, ActionConfig>,
): ActionEditorValidationIssue[] {
  const invokedActionName = typeof step.name === "string" ? step.name.trim() : "";
  if (invokedActionName.length === 0) {
    return [];
  }

  const invokedConfig = actionRunner[invokedActionName];
  if (!invokedConfig) {
    return [];
  }

  const requiredArgNames = collectRequiredArgs(invokedConfig);
  const argsValue = isRecord(step.args) ? step.args : {};
  const issues: ActionEditorValidationIssue[] = [];

  requiredArgNames.forEach((requiredArgName) => {
    const argValue = argsValue[requiredArgName];
    if (typeof argValue !== "string" || argValue.trim().length === 0) {
      issues.push({
        stepPath,
        fieldKey: `args.${requiredArgName}`,
        message: `invokeAction "${invokedActionName}" requires arg "${requiredArgName}" to be filled.`,
      });
    }
  });

  return issues;
}

function validateSelfInvocation(
  step: ActionStep,
  stepPath: StepPath,
  draft: ActionEditorDraft,
  config: AppConfig,
  rootSteps: ActionStep[],
): ActionEditorValidationIssue[] {
  if (isInsideIfElseBranch(stepPath, rootSteps)) {
    return [];
  }

  const currentActionName = draft.actionName.trim();

  if (step.action === "invokeAction") {
    const invokedName = typeof step.name === "string" ? step.name.trim() : "";
    if (invokedName === currentActionName) {
      return [
        {
          stepPath,
          fieldKey: "name",
          message:
            "Action cannot invoke itself outside an ifElse block. Place self-invocation inside then or else.",
        },
      ];
    }
  }

  if (step.action === "shell") {
    const selfInvocationTokens = buildSelfInvocationTokens(draft);

    if (shellStepInvokesSelf(step, selfInvocationTokens)) {
      return [
        {
          stepPath,
          fieldKey: resolveShellFieldKey(step),
          message:
            "Shell command cannot invoke this action outside an ifElse block. Place self-invocation inside then or else.",
        },
      ];
    }
  }

  return [];
}

export function validateActionEditorDraft(
  draft: ActionEditorDraft,
  config: AppConfig,
): ActionEditorValidationIssue[] {
  const rootSteps = getActionSteps(draft.actionConfig);
  const stepsWithPaths = collectStepsWithPaths(rootSteps, [], "steps");
  const issues: ActionEditorValidationIssue[] = [];

  stepsWithPaths.forEach(({ step, path }) => {
    if (step.action === "ifElse") {
      issues.push(...validateIfElseStep(step, path));
    }

    issues.push(...validateSelfInvocation(step, path, draft, config, rootSteps));

    if (step.action === "invokeAction") {
      issues.push(...validateInvokeActionArgs(step, path, config.actionRunner));
    }

    const fieldDefinitions = STEP_FIELD_DEFINITIONS[step.action] ?? [];
    fieldDefinitions
      .filter((fieldDefinition) => fieldDefinition.type === "object")
      .forEach((fieldDefinition) => {
        issues.push(
          ...validateObjectFieldEntries(
            step,
            path,
            fieldDefinition.key,
            fieldDefinition.label,
          ),
        );
      });
  });

  return issues;
}
