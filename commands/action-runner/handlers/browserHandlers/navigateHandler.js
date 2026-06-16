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
