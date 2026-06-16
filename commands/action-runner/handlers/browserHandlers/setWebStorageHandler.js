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
