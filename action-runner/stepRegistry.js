"use strict";

/**
 * Role: Central registry that maps step action names to executable handlers.
 * Not in this file: Step execution loop and interpolation logic.
 * Key dependencies: Browser step handlers and API/shell handlers.
 * See also: action-runner/runSteps.js, action-runner/stepHandlers.js
 */

const { stepHandlers: browserStepHandlers } = require("./stepHandlers");
const { handleApiRequest } = require("./handlers/apiRequestHandler");
const { handleExtractVariable } = require("./handlers/extractVariableHandler");
const { handleShell } = require("./handlers/shellHandler");
const { handleGetArguments } = require("./handlers/getArgumentsHandler");
const { handleInvokeAction } = require("./handlers/invokeActionHandler");
const { handleTryCatch } = require("./handlers/tryCatchHandler");
const { handleWriteFile } = require("./handlers/writeFileHandler");

const stepHandlers = {
  ...browserStepHandlers,
  apiRequest: handleApiRequest,
  extractVariable: handleExtractVariable,
  shell: handleShell,
  getArguments: handleGetArguments,
  invokeAction: handleInvokeAction,
  tryCatch: handleTryCatch,
  writeFile: handleWriteFile,
};

module.exports = {
  stepHandlers,
};
