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
 * Role: Wraps steps in try/catch/finally semantics with error context propagation.
 * Not in this file: Step execution loop and individual handler logic.
 * Key dependencies: resources.runSteps for executing child step arrays.
 * See also: action-runner/runSteps.js, action-runner/handlers/invokeActionHandler.js
 */

const ERROR_MESSAGE_KEY = "errorMessage";

function restoreErrorMessage(runtimeContext, hadPrevious, previousValue) {
  if (hadPrevious) {
    runtimeContext[ERROR_MESSAGE_KEY] = previousValue;
    return;
  }

  delete runtimeContext[ERROR_MESSAGE_KEY];
}

async function handleTryCatch(resources, step, logInfo, runtimeContext) {
  const trySteps = step.try ?? [];
  const catchSteps = step.catch ?? [];
  const finallySteps = step.finally ?? [];

  const hadPreviousErrorMessage = ERROR_MESSAGE_KEY in runtimeContext;
  const previousErrorMessage = runtimeContext[ERROR_MESSAGE_KEY];

  let caughtError = null;

  try {
    logInfo("Executing try block");
    await resources.runSteps(resources, trySteps, logInfo, runtimeContext);
    logInfo("try block completed successfully");
  } catch (error) {
    caughtError = error;
    runtimeContext[ERROR_MESSAGE_KEY] = error.message;
    logInfo(`try block failed: ${error.message}`);

    if (catchSteps.length > 0) {
      logInfo("Executing catch block");
      await resources.runSteps(resources, catchSteps, logInfo, runtimeContext);
      logInfo("catch block completed");
    }
  } finally {
    if (finallySteps.length > 0) {
      logInfo("Executing finally block");
      await resources.runSteps(resources, finallySteps, logInfo, runtimeContext);
      logInfo("finally block completed");
    }
  }

  restoreErrorMessage(runtimeContext, hadPreviousErrorMessage, previousErrorMessage);

  if (caughtError && catchSteps.length === 0) {
    throw caughtError;
  }

  return null;
}

module.exports = {
  handleTryCatch,
};
