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
