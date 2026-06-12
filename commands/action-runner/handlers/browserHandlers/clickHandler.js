"use strict";

/**
 * Role: Handles the "click" browser step with optional iframe, navigation, and post-conditions.
 * Not in this file: Type/wait/setWebStorage handlers.
 * Key dependencies: pageContext resilient helpers, browserCommon prep helpers.
 * See also: action-runner/handlers/browserHandlers/index.js
 */

const {
  getActivePage,
  getStepTimeout,
  pollFrameForSelector,
  waitForSelectorSafe,
  waitForUrlSafe,
  clickSelectorSafe,
} = require("../../pageContext");
const {
  getBrowserPageFromResources,
  prepareForSelectorAction,
} = require("./browserCommon");

async function handleClick(resources, step, logInfo) {
  const timeout = getStepTimeout(step);
  const { browser, page: existingPage } = await getBrowserPageFromResources(resources);
  let page = await prepareForSelectorAction(browser, existingPage, step, logInfo);

  if (step.iframe) {
    logInfo(`Resolving iframe ${step.iframe} for click`);

    const { frame } = await pollFrameForSelector(browser, page, step.selector, step, logInfo);
    const element = await frame.$(step.selector);

    if (!element) {
      throw new Error(`[Action Runner] Element not found in iframe: ${step.selector}`);
    }

    await element.evaluate((el) => el.click());
    resources.setPage(page);
    logInfo(`Clicked ${step.selector} inside iframe ${step.iframe}`);
    return null;
  }

  if (step.waitForNavigation) {
    logInfo("Click will trigger navigation");
    page = await waitForSelectorSafe(browser, page, step.selector, step, logInfo);

    await Promise.all([
      page
        .waitForNavigation({ waitUntil: "networkidle2", timeout })
        .catch((navigationError) => {
          logInfo(`waitForNavigation did not resolve cleanly: ${navigationError.message}`);
        }),
      page.click(step.selector),
    ]);

    logInfo(`Clicked ${step.selector}`);
    page = await getActivePage(browser, page, timeout);
    logInfo("Navigation finished, active page resolved");
  } else if (step.waitForInteractable !== false) {
    page = await clickSelectorSafe(browser, page, step.selector, step, logInfo);
  } else {
    page = await waitForSelectorSafe(browser, page, step.selector, step, logInfo);
    await page.click(step.selector);
    logInfo(`Clicked ${step.selector}`);
  }

  if (step.waitForUrl) {
    page = await waitForUrlSafe(browser, page, step.waitForUrl, step, logInfo);
    logInfo(`URL contains ${step.waitForUrl}`);
  }

  if (step.waitForSelector) {
    page = await waitForSelectorSafe(browser, page, step.waitForSelector, step, logInfo);
    logInfo(`Waited for visible selector ${step.waitForSelector}`);
  }

  resources.setPage(page);
  return null;
}

module.exports = {
  handleClick,
};
