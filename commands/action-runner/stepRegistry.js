"use strict";

/**
 * Role: Central registry that maps step action names to executable handlers.
 * Not in this file: Step execution loop and interpolation logic.
 * Key dependencies: Browser step handlers and API/shell handlers.
 * See also: action-runner/runSteps.js, action-runner/stepHandlers.js
 */

const { browserStepHandlers } = require("./handlers/browserHandlers");
const { handleApiRequest } = require("./handlers/apiRequestHandler");
const { handleSetVariable } = require("./handlers/setVariableHandler");
const { handleShell } = require("./handlers/shellHandler");
const { handleGetArguments } = require("./handlers/getArgumentsHandler");
const { handleInvokeAction } = require("./handlers/invokeActionHandler");
const { handleTryCatch } = require("./handlers/tryCatchHandler");
const { handleIfElse } = require("./handlers/ifElseHandler");
const { handleWriteFile } = require("./handlers/writeFileHandler");
const { handleForEach } = require("./handlers/forEachHandler");
const { handleWait } = require("./handlers/waitHandler");

const stepHandlers = {
  ...browserStepHandlers,
  apiRequest: handleApiRequest,
  setVariable: handleSetVariable,
  shell: handleShell,
  getArguments: handleGetArguments,
  invokeAction: handleInvokeAction,
  tryCatch: handleTryCatch,
  ifElse: handleIfElse,
  writeFile: handleWriteFile,
  forEach: handleForEach,
  wait: handleWait,
};

module.exports = {
  stepHandlers,
};
