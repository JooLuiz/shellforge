/*
 * Copyright (C) 2026 João Luiz de Castro
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 */

"use strict";

/**
 * Role: Executes normalized steps sequentially using the unified step registry.
 * Not in this file: Step validation and browser/page low-level interactions.
 * Key dependencies: stepRegistry handlers and interpolation utility.
 * See also: action-runner/stepRegistry.js, action-runner/interpolateContext.js
 */

const { stepHandlers } = require("./stepRegistry");
const { interpolateStep } = require("./interpolateContext");

const BLOCK_STEPS_WITH_NESTED_INTERPOLATION = new Set([
  "tryCatch",
  "ifElse",
  "forEachElement",
  "forEach",
]);

const NESTED_STEP_ARRAY_KEYS = ["steps", "try", "catch", "finally", "then", "else"];

function interpolateBlockStep(step, runtimeContext) {
  const preservedNestedEntries = NESTED_STEP_ARRAY_KEYS
    .filter((nestedKey) => step[nestedKey] !== undefined)
    .map((nestedKey) => [nestedKey, step[nestedKey]]);

  const stepWithoutNested = { ...step };
  preservedNestedEntries.forEach(([nestedKey]) => {
    delete stepWithoutNested[nestedKey];
  });

  const interpolatedTopLevel = interpolateStep(stepWithoutNested, runtimeContext);

  preservedNestedEntries.forEach(([nestedKey, originalValue]) => {
    interpolatedTopLevel[nestedKey] = originalValue;
  });

  return interpolatedTopLevel;
}

async function runSteps(resources, steps, logInfo, runtimeContext) {
  for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
    const step = steps[stepIndex];
    const stepNumber = stepIndex + 1;
    const handler = stepHandlers[step.action];

    if (!handler) {
      throw new Error(`[Action Runner] No handler configured for action "${step.action}"`);
    }

    const isBlockStep = BLOCK_STEPS_WITH_NESTED_INTERPOLATION.has(step.action);
    const interpolatedStep = isBlockStep
      ? interpolateBlockStep(step, runtimeContext)
      : interpolateStep(step, runtimeContext);

    logInfo(`Running step ${stepNumber}: ${step.action}`);

    await handler(resources, interpolatedStep, (message) => {
      logInfo(`Step ${stepNumber} (${step.action}) - ${message}`);
    }, runtimeContext);
  }
}

module.exports = {
  runSteps,
};
