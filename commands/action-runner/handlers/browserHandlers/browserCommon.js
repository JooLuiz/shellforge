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
 * Role: Shared helpers for browser-focused step handlers.
 * Not in this file: Step-specific logic or page/frame resilience.
 * Key dependencies: Action runner resources factory (browser/page lifecycle).
 * See also: action-runner/pageContext.js, action-runner/handlers/browserHandlers/index.js
 *
 * Handler contract: all step handlers (browser and non-browser) return null.
 * Page state is communicated via resources.setPage(page) before returning.
 */

const { waitForLoadingOverlaySafe } = require("../../pageContext");

async function getBrowserPageFromResources(resources) {
  const browser = await resources.getBrowser();
  const page = await resources.getPage();

  return { browser, page };
}

async function prepareForSelectorAction(browser, page, step, logInfo) {
  if (step.waitForLoading) {
    return waitForLoadingOverlaySafe(browser, page, step, logInfo);
  }

  return page;
}

module.exports = {
  getBrowserPageFromResources,
  prepareForSelectorAction,
};
