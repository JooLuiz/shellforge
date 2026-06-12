"use strict";

/**
 * Role: Handles the "setWebStorage" browser step (localStorage, sessionStorage, cookies).
 * Not in this file: Navigation or selector waiting.
 * Key dependencies: Puppeteer page.evaluate / page.setCookie.
 * See also: action-runner/handlers/browserHandlers/index.js
 */

const { getBrowserPageFromResources } = require("./browserCommon");

async function handleSetWebStorage(resources, step, logInfo) {
  const { page } = await getBrowserPageFromResources(resources);

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

  resources.setPage(page);
  return null;
}

module.exports = {
  handleSetWebStorage,
};
