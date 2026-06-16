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

const path = require("node:path");

// Keep in sync with ui/src/main/services/shellforgeRuntimeLayout.ts.
const SHELLFORGE_APP_DATA_DIR_NAME = "ShellForge";
const USER_DATA_REPO_DIR_NAME = "shellforge-data";

function getPackagedUserDataRoot(appDataPath) {
  return path.join(appDataPath, SHELLFORGE_APP_DATA_DIR_NAME, USER_DATA_REPO_DIR_NAME);
}

module.exports = {
  SHELLFORGE_APP_DATA_DIR_NAME,
  USER_DATA_REPO_DIR_NAME,
  getPackagedUserDataRoot,
};
