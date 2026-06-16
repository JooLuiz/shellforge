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
 * Role: Handles the "closeBrowser" browser step (gracefully terminates the browser).
 * Not in this file: Page lifecycle management beyond browser teardown.
 * Key dependencies: Action runner resources factory.
 * See also: action-runner/handlers/browserHandlers/index.js
 */

async function handleCloseBrowser(resources, _step, logInfo) {
  await resources.closeBrowser();
  logInfo("Browser closed");
  return null;
}

module.exports = {
  handleCloseBrowser,
};
