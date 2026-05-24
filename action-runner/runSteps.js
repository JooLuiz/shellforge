"use strict";

/**
 * Role: Executes normalized steps sequentially using the unified step registry.
 * Not in this file: Step validation and browser/page low-level interactions.
 * Key dependencies: stepRegistry handlers and interpolation utility.
 * See also: action-runner/stepRegistry.js, action-runner/interpolateContext.js
 */

const { stepHandlers } = require("./stepRegistry");
const { interpolateStep } = require("./interpolateContext");

async function runSteps(resources, steps, logInfo, runtimeContext) {
  for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
    const step = steps[stepIndex];
    const stepNumber = stepIndex + 1;
    const handler = stepHandlers[step.action];

    if (!handler) {
      throw new Error(`[Action Runner] No handler configured for action "${step.action}"`);
    }

    const shouldSkipInterpolation = step.action === "tryCatch";
    const interpolatedStep = shouldSkipInterpolation ? step : interpolateStep(step, runtimeContext);

    logInfo(`Running step ${stepNumber}: ${step.action}`);

    await handler(resources, interpolatedStep, (message) => {
      logInfo(`Step ${stepNumber} (${step.action}) - ${message}`);
    }, runtimeContext);
  }
}

module.exports = {
  runSteps,
};
