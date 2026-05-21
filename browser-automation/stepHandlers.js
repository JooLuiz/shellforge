const {
  getActivePage,
  pollFrameForSelector,
  waitForSelectorSafe,
  waitForUrlSafe,
  waitForLoadingOverlaySafe,
  clickSelectorSafe,
} = require("./pageContext");

const DEFAULT_SELECTOR_TIMEOUT_MS = 30000;

function getStepTimeout(step) {
  return step.timeout ?? DEFAULT_SELECTOR_TIMEOUT_MS;
}

async function prepareForSelectorAction(browser, page, step, logInfo) {
  if (step.waitForLoading) {
    page = await waitForLoadingOverlaySafe(browser, page, step, logInfo);
  }

  return page;
}

async function handleNavigate(browser, page, step, logInfo) {
  await page.goto(step.url, { waitUntil: "domcontentloaded" });
  logInfo(`Navigated to ${step.url}`);
  return page;
}

async function handleType(browser, page, step, logInfo) {
  page = await prepareForSelectorAction(browser, page, step, logInfo);
  page = await waitForSelectorSafe(browser, page, step.selector, step, logInfo);

  await page.focus(step.selector);
  await page.keyboard.type(step.value, { delay: step.delay ?? 10 });

  logInfo(`Typed into ${step.selector}`);
  return page;
}

async function handleClick(browser, page, step, logInfo) {
  const timeout = getStepTimeout(step);

  page = await prepareForSelectorAction(browser, page, step, logInfo);

  if (step.iframe) {
    logInfo(`Resolving iframe ${step.iframe} for click`);

    const { frame } = await pollFrameForSelector(browser, page, step.selector, step, logInfo);

    const element = await frame.$(step.selector);

    if (!element) {
      throw new Error(`[Browser Automation] Element not found in iframe: ${step.selector}`);
    }

    await element.evaluate((el) => el.click());
    logInfo(`Clicked ${step.selector} inside iframe ${step.iframe}`);

    return page;
  }

  if (step.waitForNavigation) {
    logInfo("Click will trigger navigation");

    page = await waitForSelectorSafe(browser, page, step.selector, step, logInfo);

    await Promise.all([
      page
        .waitForNavigation({ waitUntil: "networkidle2", timeout })
        .catch(() => null),
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

  return page;
}

async function handleWait(browser, page, step, logInfo) {
  if (step.waitForLoading) {
    page = await waitForLoadingOverlaySafe(browser, page, step, logInfo);
    logInfo("Loading overlays finished");
    return page;
  }

  if (typeof step.urlContains === "string" && step.urlContains.length > 0) {
    page = await waitForUrlSafe(browser, page, step.urlContains, step, logInfo);
    logInfo(`URL contains ${step.urlContains}`);
    return page;
  }

  if (typeof step.ms === "number") {
    await new Promise((resolve) => setTimeout(resolve, step.ms));
    logInfo(`Waited ${step.ms}ms`);
    return page;
  }

  page = await prepareForSelectorAction(browser, page, step, logInfo);
  page = await waitForSelectorSafe(browser, page, step.selector, step, logInfo);
  logInfo(`Waited for visible selector ${step.selector}`);
  return page;
}

async function handleSetWebStorage(browser, page, step, logInfo) {
  if (step.localStorage) {
    await page.evaluate((items) => {
      for (const [key, value] of Object.entries(items)) {
        const serialized = typeof value === "string" ? value : JSON.stringify(value);
        localStorage.setItem(key, serialized);
      }
    }, step.localStorage);
    logInfo(`Set ${Object.keys(step.localStorage).length} localStorage item(s)`);
  }

  if (step.sessionStorage) {
    await page.evaluate((items) => {
      for (const [key, value] of Object.entries(items)) {
        const serialized = typeof value === "string" ? value : JSON.stringify(value);
        sessionStorage.setItem(key, serialized);
      }
    }, step.sessionStorage);
    logInfo(`Set ${Object.keys(step.sessionStorage).length} sessionStorage item(s)`);
  }

  if (step.cookies) {
    await page.setCookie(...step.cookies);
    logInfo(`Set ${step.cookies.length} cookie(s)`);
  }

  return page;
}

async function handleCloseBrowser(browser, page, step, logInfo) {
  await browser.close();
  logInfo("Browser closed");
  return page;
}

const stepHandlers = {
  navigate: handleNavigate,
  type: handleType,
  click: handleClick,
  wait: handleWait,
  setWebStorage: handleSetWebStorage,
  closeBrowser: handleCloseBrowser,
};

module.exports = {
  stepHandlers,
  DEFAULT_SELECTOR_TIMEOUT_MS,
};
