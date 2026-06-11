"use strict";

/**
 * Role: Handles the "navigate" browser step (page.goto with domcontentloaded wait).
 * Not in this file: Selector waiting or click orchestration.
 * Key dependencies: Action runner resources (browser/page lifecycle).
 * See also: action-runner/handlers/browserHandlers/index.js
 */

const { waitForLoadingOverlaySafe } = require("../../pageContext");
const { getBrowserPageFromResources } = require("./browserCommon");

async function handleNavigate(resources, step, logInfo) {
  const { browser, page } = await getBrowserPageFromResources(resources);
  await page.goto(step.url, { waitUntil: "domcontentloaded" });

  if (step.waitForLoading) {
    await waitForLoadingOverlaySafe(browser, page, step, logInfo);
    logInfo("Loading overlays finished");
  }

  resources.setPage(page);
  logInfo(`Navigated to ${step.url}`);
  return null;
}

module.exports = {
  handleNavigate,
};
