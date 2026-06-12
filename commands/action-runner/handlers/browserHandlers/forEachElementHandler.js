"use strict";

/**
 * Role: Iterates over DOM elements and runs browser sub-steps for each match.
 * Not in this file: Generic (non-browser) iteration (see handlers/forEachHandler.js).
 * Key dependencies: Action runner resources, interpolateContext, browser sibling handlers via ./index.
 * See also: action-runner/handlers/browserHandlers/index.js
 */

const { interpolateStep } = require("../../interpolateContext");
const { handleApiRequest } = require("../apiRequestHandler");
const { handleWait } = require("../waitHandler");
const { getBrowserPageFromResources } = require("./browserCommon");

const FOR_EACH_ELEMENT_ALLOWED_NON_BROWSER_ACTIONS = ["wait", "apiRequest"];

function getBrowserStepHandlers() {
  // Lazy require avoids a circular import: ./index imports this file at module load.
  // By the time this function runs, ./index has finished evaluating.
  return require("./index").browserStepHandlers;
}

function getForEachElementSubStepHandlers() {
  const browserStepHandlers = getBrowserStepHandlers();
  return {
    ...browserStepHandlers,
    wait: handleWait,
    apiRequest: handleApiRequest,
  };
}

async function collectValidEntries(page, step) {
  const excludePatterns = step.excludeTextPatterns ?? [];
  const skipConfig = step.skipIfPositionMatch ?? null;

  return page.evaluate(
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
              (sibling) =>
                sibling.style.top === elementTop && sibling.style.height === elementHeight
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
}

async function markCurrentElement(page, selector, elementIndex) {
  await page.evaluate(
    (targetSelector, targetIndex) => {
      const element = document.querySelectorAll(targetSelector)[targetIndex];

      if (element) {
        element.setAttribute("data-ar-current", "true");
      }
    },
    selector,
    elementIndex
  );
}

async function clickInsideCurrentElement(page, clickSelector) {
  await page.evaluate((targetSelector) => {
    const markedParent = document.querySelector("[data-ar-current='true']");

    if (!markedParent) {
      return;
    }

    const target = markedParent.querySelector(targetSelector);

    if (!target) {
      return;
    }

    const clickTarget = target instanceof SVGElement ? target.parentElement : target;

    clickTarget.click();
  }, clickSelector);
}

async function clearCurrentMarker(page) {
  await page.evaluate(() => {
    const marked = document.querySelector("[data-ar-current='true']");

    if (marked) {
      marked.removeAttribute("data-ar-current");
    }
  });
}

async function runBrowserSubSteps(resources, subSteps, logInfo, runtimeContext) {
  const supportedSubStepHandlers = getForEachElementSubStepHandlers();
  let activePage = await resources.getPage();

  for (let subStepIndex = 0; subStepIndex < subSteps.length; subStepIndex++) {
    const rawSubStep = subSteps[subStepIndex];
    const subStep = interpolateStep(rawSubStep, runtimeContext);
    const subStepNumber = subStepIndex + 1;
    const handler = supportedSubStepHandlers[subStep.action];

    if (!handler) {
      throw new Error(
        `[Action Runner] forEachElement supports browser actions plus explicit allowlist actions (${FOR_EACH_ELEMENT_ALLOWED_NON_BROWSER_ACTIONS.join(
          ", "
        )}). Unsupported sub-step action "${subStep.action}".`
      );
    }

    logInfo(`  Sub-step ${subStepNumber}: ${subStep.action}`);

    await handler(
      resources,
      subStep,
      (message) => {
        logInfo(`  Sub-step ${subStepNumber} (${subStep.action}) - ${message}`);
      },
      runtimeContext
    );

    activePage = await resources.getPage();
  }

  return activePage;
}

async function handleForEachElement(resources, step, logInfo, runtimeContext) {
  const { page: existingPage } = await getBrowserPageFromResources(resources);
  let page = existingPage;

  const validEntries = await collectValidEntries(page, step);
  logInfo(`Found ${validEntries.length} valid element(s) to process`);

  for (const { index, text } of validEntries) {
    logInfo(`Processing element ${index}: "${text}"`);

    await markCurrentElement(page, step.selector, index);

    if (step.clickSelector) {
      await clickInsideCurrentElement(page, step.clickSelector);
      logInfo(`Clicked ${step.clickSelector} within element ${index}`);
    }

    page = await runBrowserSubSteps(resources, step.steps, logInfo, runtimeContext);

    await clearCurrentMarker(page);
  }

  resources.setPage(page);
  return null;
}

module.exports = {
  handleForEachElement,
};
