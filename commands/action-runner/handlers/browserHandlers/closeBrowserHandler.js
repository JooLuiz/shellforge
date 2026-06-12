"use strict";

/**
 * Role: Handles the "closeBrowser" browser step (gracefully terminates the browser).
 * Not in this file: Page lifecycle management beyond browser teardown.
 * Key dependencies: Action runner resources factory.
 * See also: action-runner/handlers/browserHandlers/index.js
 */

async function handleCloseBrowser(resources, _step, logInfo) {
  await resources.closeBrowser();
  logInfo("Browser closed");
  return null;
}

module.exports = {
  handleCloseBrowser,
};
