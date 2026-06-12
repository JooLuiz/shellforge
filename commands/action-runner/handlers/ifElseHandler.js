"use strict";

/**
 * Role: Evaluates a comparison condition and runs then/else step branches.
 * Not in this file: Step validation and interpolation orchestration.
 * Key dependencies: resources.runSteps for executing child step arrays.
 * See also: action-runner/runSteps.js, action-runner/interpolateContext.js
 */

const VALID_OPERATORS = new Set(["eq", "gt", "gte", "lt", "lte", "exists"]);

function coerceComparablePair(leftValue, rightValue) {
  const leftAsNumber = Number(leftValue);
  const rightAsNumber = Number(rightValue);

  if (
    Number.isFinite(leftAsNumber) &&
    Number.isFinite(rightAsNumber) &&
    String(leftValue).trim().length > 0 &&
    String(rightValue).trim().length > 0
  ) {
    return { left: leftAsNumber, right: rightAsNumber };
  }

  return { left: String(leftValue), right: String(rightValue) };
}

function evaluateCondition(leftValue, operator, rightValue) {
  if (!VALID_OPERATORS.has(operator)) {
    throw new Error(`[Action Runner] ifElse: unsupported operator "${operator}"`);
  }

  if (operator === "exists") {
    return leftValue !== undefined && leftValue !== null && leftValue !== "";
  }

  const comparable = coerceComparablePair(leftValue, rightValue);

  switch (operator) {
    case "eq":
      return comparable.left === comparable.right;
    case "gt":
      return comparable.left > comparable.right;
    case "gte":
      return comparable.left >= comparable.right;
    case "lt":
      return comparable.left < comparable.right;
    case "lte":
      return comparable.left <= comparable.right;
    default:
      return false;
  }
}

async function handleIfElse(resources, step, logInfo, runtimeContext) {
  const thenSteps = Array.isArray(step.then) ? step.then : [];
  const elseSteps = Array.isArray(step.else) ? step.else : [];
  const operator = step.operator;

  const conditionResult = evaluateCondition(step.left, operator, step.right);

  logInfo(
    `Condition "${step.left}" ${operator} ${operator === "exists" ? "" : String(step.right)} → ${conditionResult}`
  );

  if (conditionResult) {
    if (thenSteps.length > 0) {
      logInfo("Executing then block");
      await resources.runSteps(resources, thenSteps, logInfo, runtimeContext);
      logInfo("then block completed");
    }
    return null;
  }

  if (elseSteps.length > 0) {
    logInfo("Executing else block");
    await resources.runSteps(resources, elseSteps, logInfo, runtimeContext);
    logInfo("else block completed");
  }

  return null;
}

module.exports = {
  handleIfElse,
  evaluateCondition,
  VALID_OPERATORS,
};
