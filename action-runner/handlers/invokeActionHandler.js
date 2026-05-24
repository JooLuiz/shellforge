"use strict";

/**
 * Role: Executes another action from config as a child step with isolated context.
 * Not in this file: Step handler registration and CLI argument parsing.
 * Key dependencies: resources.configs, resources.runSteps, resources.normalizeSteps.
 * See also: action-runner/action-runner.js, action-runner/runSteps.js
 */

const MAX_INVOKE_DEPTH = 5;
const INTERNAL_CONTEXT_KEY = "__callDepth";

async function handleInvokeAction(resources, step, logInfo, runtimeContext) {
  const actionName = step.name;
  const actionArgs = step.args ?? {};
  const continueOnError = step.continueOnError === true;

  const currentDepth = runtimeContext[INTERNAL_CONTEXT_KEY] ?? 0;

  if (currentDepth >= MAX_INVOKE_DEPTH) {
    throw new Error(
      `[Action Runner] invokeAction: max call depth (${MAX_INVOKE_DEPTH}) exceeded when invoking "${actionName}". Possible infinite recursion.`
    );
  }

  const actionConfig = resources.configs?.actionRunner?.[actionName];

  if (!actionConfig) {
    throw new Error(
      `[Action Runner] invokeAction: action "${actionName}" not found in actionRunner config.`
    );
  }

  const childSteps = resources.normalizeSteps(actionConfig, actionName);

  const childContext = {
    inputArgs: { ...actionArgs },
    [INTERNAL_CONTEXT_KEY]: currentDepth + 1,
  };

  logInfo(`Invoking action "${actionName}" (depth ${currentDepth + 1})`);

  try {
    await resources.runSteps(resources, childSteps, (message) => {
      logInfo(`[${actionName}] ${message}`);
    }, childContext);

    logInfo(`Action "${actionName}" completed successfully`);
  } catch (invocationError) {
    const invocationErrorMessage = invocationError?.message ?? "Unknown child action failure";
    const wrappedError = new Error(
      `[Action Runner] invokeAction "${actionName}" failed: ${invocationErrorMessage}`
    );
    runtimeContext.failedStage = actionName;

    if (continueOnError) {
      logInfo(`Action "${actionName}" failed but continueOnError is true: ${invocationErrorMessage}`);
    } else {
      throw wrappedError;
    }
  }

  if (typeof step.storeAs === "string" && step.storeAs.length > 0) {
    const exportedContext = { ...childContext };
    delete exportedContext[INTERNAL_CONTEXT_KEY];
    delete exportedContext.inputArgs;

    runtimeContext[step.storeAs] = exportedContext;
    logInfo(`Stored child action context in context.${step.storeAs}`);
  }

  return null;
}

module.exports = {
  handleInvokeAction,
};
