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

const { getConfigs } = require("../utils/getConfig");
const { logger } = require("../utils/logger");
const { consts } = require("./consts");
const { convertCSVToJson } = require("./convertCSVToJson");
const { createPuppeteerBrowser } = require("./createPuppeteerBrowser");
const { getArgValue } = require("./getArgValue");
const { writeInFile } = require("./writeInFile");

module.exports = {
  getConfigs,
  logger,
  getArgValue,
  consts,
  convertCSVToJson,
  writeInFile,
  createPuppeteerBrowser
};
