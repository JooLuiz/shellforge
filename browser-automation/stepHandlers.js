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

async function handleForEachElement(browser, page, step, logInfo) {
  const excludePatterns = step.excludeTextPatterns ?? [];
  const skipConfig = step.skipIfPositionMatch ?? null;

  const validEntries = await page.evaluate(
    (selector, textContentSelector, patterns, positionMatchConfig) => {
      const elements = document.querySelectorAll(selector);
      const entries = [];

      elements.forEach((element, index) => {
        const textElement = textContentSelector
          ? element.querySelector(textContentSelector)
          : element;
        const text = (textElement?.textContent ?? "").trim();
        const shouldExclude = patterns.some((pattern) => text.includes(pattern));

        if (shouldExclude) {
          return;
        }

        if (positionMatchConfig) {
          const scope = element.closest(positionMatchConfig.scopeSelector);

          if (scope) {
            const siblings = scope.querySelectorAll(positionMatchConfig.matchSelector);
            const elementTop = element.style.top;
            const elementHeight = element.style.height;
            const alreadyRegistered = Array.from(siblings).some(
              (sibling) => sibling.style.top === elementTop && sibling.style.height === elementHeight
            );

            if (alreadyRegistered) {
              return;
            }
          }
        }

        entries.push({ index, text });
      });

      return entries;
    },
    step.selector,
    step.textContentSelector,
    excludePatterns,
    skipConfig
  );

  logInfo(`Found ${validEntries.length} valid element(s) to process`);

  for (const { index, text } of validEntries) {
    logInfo(`Processing element ${index}: "${text}"`);

    await page.evaluate(
      (selector, elementIndex) => {
        const element = document.querySelectorAll(selector)[elementIndex];

        if (element) {
          element.setAttribute("data-ba-current", "true");
        }
      },
      step.selector,
      index
    );

    if (step.clickSelector) {
      await page.evaluate((clickSelector) => {
        const markedParent = document.querySelector("[data-ba-current='true']");

        if (!markedParent) {
          return;
        }

        const target = markedParent.querySelector(clickSelector);

        if (!target) {
          return;
        }

        const clickTarget = target instanceof SVGElement
          ? target.parentElement
          : target;

        clickTarget.click();
      }, step.clickSelector);

      logInfo(`Clicked ${step.clickSelector} within element ${index}`);
    }

    let activePage = page;

    for (let subStepIndex = 0; subStepIndex < step.steps.length; subStepIndex++) {
      const subStep = step.steps[subStepIndex];
      const subStepNumber = subStepIndex + 1;
      const handler = stepHandlers[subStep.action];

      logInfo(`  Sub-step ${subStepNumber}: ${subStep.action}`);

      activePage = await handler(browser, activePage, subStep, (message) => {
        logInfo(`  Sub-step ${subStepNumber} (${subStep.action}) - ${message}`);
      });
    }

    page = activePage;

    await page.evaluate(() => {
      const marked = document.querySelector("[data-ba-current='true']");

      if (marked) {
        marked.removeAttribute("data-ba-current");
      }
    });
  }

  return page;
}

const stepHandlers = {
  navigate: handleNavigate,
  type: handleType,
  click: handleClick,
  wait: handleWait,
  setWebStorage: handleSetWebStorage,
  closeBrowser: handleCloseBrowser,
  forEachElement: handleForEachElement,
};

module.exports = {
  stepHandlers,
  DEFAULT_SELECTOR_TIMEOUT_MS,
};
