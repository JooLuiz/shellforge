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
 * Role: Handles the "waitForPageState" browser step (selector, urlContains, or loading overlay).
 * Not in this file: Generic time-based wait (see handlers/waitHandler.js).
 * Key dependencies: pageContext resilient helpers, browserCommon prep helpers.
 * See also: action-runner/handlers/browserHandlers/index.js
 */

const {
  waitForSelectorSafe,
  waitForUrlSafe,
  waitForLoadingOverlaySafe,
  pollFrameForSelector,
} = require("../../pageContext");
const {
  getBrowserPageFromResources,
  prepareForSelectorAction,
} = require("./browserCommon");

async function handleWaitForPageState(resources, step, logInfo) {
  const { browser, page: existingPage } = await getBrowserPageFromResources(resources);
  let page = existingPage;

  if (step.iframe && typeof step.selector === "string" && step.selector.length > 0) {
    await pollFrameForSelector(browser, page, step.selector, step, logInfo);
    resources.setPage(page);
    logInfo(`Selector ${step.selector} found in iframe ${step.iframe}`);
    return null;
  }

  if (step.waitForLoading && !step.selector && !step.urlContains) {
    page = await waitForLoadingOverlaySafe(browser, page, step, logInfo);
    resources.setPage(page);
    logInfo("Loading overlays finished");
    return null;
  }

  if (typeof step.urlContains === "string" && step.urlContains.length > 0) {
    page = await waitForUrlSafe(browser, page, step.urlContains, step, logInfo);
    resources.setPage(page);
    logInfo(`URL contains ${step.urlContains}`);
    return null;
  }

  page = await prepareForSelectorAction(browser, page, step, logInfo);
  page = await waitForSelectorSafe(browser, page, step.selector, step, logInfo);
  resources.setPage(page);
  logInfo(`Waited for visible selector ${step.selector}`);
  return null;
}

module.exports = {
  handleWaitForPageState,
};
