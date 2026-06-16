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
 * Role: Provides resilient page/frame helpers for browser-based actions.
 * Not in this file: Business-level step orchestration and config validation.
 * Key dependencies: Puppeteer Browser/Page/Frame APIs.
 * See also: action-runner/stepHandlers.js, action-runner/runSteps.js
 */

const DEFAULT_PAGE_RECOVERY_TIMEOUT_MS = 60000;
const POLL_INTERVAL_MS = 500;

function isRecoverableError(error) {
  const message = error?.message ?? "";

  return (
    error?.name === "TargetCloseError" ||
    message.includes("Target closed") ||
    message.includes("Session closed") ||
    message.includes("Protocol error") ||
    message.includes("Execution context was destroyed") ||
    message.includes("Cannot find context") ||
    message.includes("frame got detached")
  );
}

function getStepTimeout(step) {
  return step.timeout ?? DEFAULT_PAGE_RECOVERY_TIMEOUT_MS;
}

async function getActivePage(browser, preferredPage, timeout = DEFAULT_PAGE_RECOVERY_TIMEOUT_MS) {
  if (preferredPage && !preferredPage.isClosed()) {
    return preferredPage;
  }

  const openPages = (await browser.pages()).filter((openPage) => !openPage.isClosed());

  if (openPages.length > 0) {
    return openPages[openPages.length - 1];
  }

  const pageTarget = await browser.waitForTarget(
    (target) => target.type() === "page",
    { timeout }
  );

  return pageTarget.page();
}

async function pollPageCondition(browser, page, evaluateFn, args, step, logInfo) {
  const timeout = getStepTimeout(step);
  const startTime = Date.now();
  let activePage = page;

  while (Date.now() - startTime < timeout) {
    activePage = await getActivePage(browser, activePage, timeout);

    try {
      const result = await activePage.evaluate(evaluateFn, ...args);

      if (result) {
        return activePage;
      }
    } catch (error) {
      if (!isRecoverableError(error)) {
        throw error;
      }

      logInfo("Execution context lost, retrying with fresh page reference");
      activePage = await getActivePage(browser, null, timeout);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(
    `[Action Runner] Timed out after ${timeout}ms waiting for page condition`
  );
}

async function waitForSelectorSafe(browser, page, selector, step, logInfo) {
  return pollPageCondition(
    browser,
    page,
    (targetSelector) => {
      const element = document.querySelector(targetSelector);

      if (!element) {
        return false;
      }

      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();

      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        rect.width > 0 &&
        rect.height > 0
      );
    },
    [selector],
    step,
    logInfo
  );
}

async function waitForUrlSafe(browser, page, urlContains, step, logInfo) {
  return pollPageCondition(
    browser,
    page,
    (pattern) => window.location.href.includes(pattern),
    [urlContains],
    step,
    logInfo
  );
}

async function waitForLoadingOverlaySafe(browser, page, step, logInfo) {
  logInfo("Waiting for loading overlays to finish");

  return pollPageCondition(
    browser,
    page,
    () => {
      const containers = document.querySelectorAll(".s-loading-state-container");

      if (containers.length === 0) {
        return true;
      }

      return Array.from(containers).every((container) => {
        const loader = container.querySelector(".loader");
        const overlay = container.querySelector(".overlay");

        const isHidden = (element) => {
          if (!element) {
            return true;
          }

          const style = window.getComputedStyle(element);

          return (
            style.display === "none" ||
            style.visibility === "hidden" ||
            Number(style.opacity) === 0
          );
        };

        return isHidden(loader) && isHidden(overlay);
      });
    },
    [],
    step,
    logInfo
  );
}

async function waitForInteractableSafe(browser, page, selector, step, logInfo) {
  logInfo(`Waiting for interactable element ${selector}`);

  return pollPageCondition(
    browser,
    page,
    (targetSelector) => {
      const element = document.querySelector(targetSelector);

      if (!element) {
        return false;
      }

      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();

      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.pointerEvents !== "none" &&
        rect.width > 0 &&
        rect.height > 0
      );
    },
    [selector],
    step,
    logInfo
  );
}

async function resolveFrameFromPage(page, iframeSelector) {
  const iframeElement = await page.$(iframeSelector);

  if (!iframeElement) {
    return null;
  }

  return iframeElement.contentFrame();
}

async function findSelectorInFrameTree(frame, selector) {
  try {
    const found = await frame.evaluate((targetSelector) => {
      const element = document.querySelector(targetSelector);

      if (!element) {
        return false;
      }

      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();

      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        rect.width > 0 &&
        rect.height > 0
      );
    }, selector);

    if (found) {
      return frame;
    }
  } catch {
    return null;
  }

  for (const childFrame of frame.childFrames()) {
    const result = await findSelectorInFrameTree(childFrame, selector);

    if (result) {
      return result;
    }
  }

  return null;
}

async function pollFrameForSelector(browser, page, selector, step, logInfo) {
  const timeout = getStepTimeout(step);
  const startTime = Date.now();
  let activePage = page;
  let parentFrame = null;

  while (Date.now() - startTime < timeout) {
    try {
      activePage = await getActivePage(browser, activePage, timeout);

      if (!parentFrame) {
        parentFrame = await resolveFrameFromPage(activePage, step.iframe);

        if (!parentFrame) {
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
          continue;
        }

        logInfo(`Iframe ${step.iframe} content frame obtained, searching frame tree for selector`);
      }

      const matchingFrame = await findSelectorInFrameTree(parentFrame, selector);

      if (matchingFrame) {
        logInfo(`Found ${selector} in frame tree`);
        return { frame: matchingFrame, page: activePage };
      }
    } catch (error) {
      if (!isRecoverableError(error)) {
        throw error;
      }

      logInfo(`Frame context lost (${error.message}), re-resolving iframe`);
      parentFrame = null;
      activePage = await getActivePage(browser, null, timeout);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(
    `[Action Runner] Timed out after ${timeout}ms waiting for ${selector} in iframe ${step.iframe}`
  );
}

async function clickSelectorSafe(browser, page, selector, step, logInfo) {
  page = await waitForInteractableSafe(browser, page, selector, step, logInfo);

  const element = await page.$(selector);

  if (!element) {
    throw new Error(`[Action Runner] Element not found for click: ${selector}`);
  }

  if (step.jsClick) {
    await element.evaluate((el) => el.click());
  } else {
    await element.click();
  }

  logInfo(`Clicked ${selector}`);

  return page;
}

module.exports = {
  isRecoverableError,
  getActivePage,
  pollPageCondition,
  pollFrameForSelector,
  waitForSelectorSafe,
  waitForUrlSafe,
  waitForLoadingOverlaySafe,
  waitForInteractableSafe,
  clickSelectorSafe,
  getStepTimeout,
  DEFAULT_PAGE_RECOVERY_TIMEOUT_MS,
};
