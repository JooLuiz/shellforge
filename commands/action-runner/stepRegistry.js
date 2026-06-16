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
