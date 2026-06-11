"use strict";

/**
 * Role: Handles the "type" browser step (focus selector and type a value).
 * Not in this file: Click orchestration or selector resilience polling.
 * Key dependencies: pageContext.waitForSelectorSafe, browserCommon helpers.
 * See also: action-runner/handlers/browserHandlers/index.js
 */

const { waitForSelectorSafe, pollFrameForSelector } = require("../../pageContext");
const {
  getBrowserPageFromResources,
  prepareForSelectorAction,
} = require("./browserCommon");

async function handleType(resources, step, logInfo) {
  const { browser, page: existingPage } = await getBrowserPageFromResources(resources);

  if (step.iframe) {
    const { frame } = await pollFrameForSelector(browser, existingPage, step.selector, step, logInfo);
    await frame.focus(step.selector);
    await frame.type(step.selector, step.value, { delay: step.delay ?? 10 });
    resources.setPage(existingPage);
    logInfo(`Typed into ${step.selector} inside iframe ${step.iframe}`);
    return null;
  }

  let page = await prepareForSelectorAction(browser, existingPage, step, logInfo);
  page = await waitForSelectorSafe(browser, page, step.selector, step, logInfo);

  await page.focus(step.selector);
  await page.keyboard.type(step.value, { delay: step.delay ?? 10 });

  resources.setPage(page);
  logInfo(`Typed into ${step.selector}`);
  return null;
}

module.exports = {
  handleType,
};
