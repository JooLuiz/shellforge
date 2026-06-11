"use strict";

/**
 * Role: Generic delay step (setTimeout) with no browser dependency.
 * Not in this file: Browser-state polling (see browserHandlers/waitForPageStateHandler.js).
 * Key dependencies: Node.js setTimeout.
 * See also: action-runner/stepRegistry.js
 */

async function handleWait(_resources, step, logInfo) {
  await new Promise((resolve) => setTimeout(resolve, step.ms));
  logInfo(`Waited ${step.ms}ms`);
  return null;
}

module.exports = {
  handleWait,
};
