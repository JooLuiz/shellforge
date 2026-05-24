"use strict";

/**
 * Role: Writes a resolved value into the shared runtime context.
 * Not in this file: Resolving dynamic placeholders from source strings.
 * Key dependencies: Action runner context object.
 * See also: action-runner/interpolateContext.js, action-runner/runSteps.js
 */

async function handleExtractVariable(_resources, step, logInfo, runtimeContext) {
  runtimeContext[step.storeAs] = step.source;
  logInfo(`Stored value in context.${step.storeAs}`);
  return null;
}

module.exports = {
  handleExtractVariable,
};
