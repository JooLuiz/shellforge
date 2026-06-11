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
