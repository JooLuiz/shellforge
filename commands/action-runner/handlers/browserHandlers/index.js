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
 * Role: Assembles the browser-only step handler registry consumed by stepRegistry.
 * Not in this file: Non-browser handlers (apiRequest, shell, forEach, etc.).
 * Key dependencies: Per-action handler modules in this folder.
 * See also: action-runner/stepRegistry.js
 */

const { handleNavigate } = require("./navigateHandler");
const { handleType } = require("./typeHandler");
const { handleClick } = require("./clickHandler");
const { handleWaitForPageState } = require("./waitForPageStateHandler");
const { handleSetWebStorage } = require("./setWebStorageHandler");
const { handleCloseBrowser } = require("./closeBrowserHandler");
const { handleForEachElement } = require("./forEachElementHandler");

const browserStepHandlers = {
  navigate: handleNavigate,
  type: handleType,
  click: handleClick,
  waitForPageState: handleWaitForPageState,
  setWebStorage: handleSetWebStorage,
  closeBrowser: handleCloseBrowser,
  forEachElement: handleForEachElement,
};

module.exports = {
  browserStepHandlers,
};
