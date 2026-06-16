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

const consts = {
  identification: {
    scheduler: "[Scheduler]",
    actionRunner: "[Action Runner]",
    getArgValue: "[Utils - Get Arg Value]",
    convertCSVToJson: "[Utils - Convert CSV To Json]",
    saveNewFile: "[Utils - Write In File]",
    createPuppeteerBrowser: "[Utils - Create Puppeteer Browser]"
  },
  missingActionMsg: "Missing action to be performed",
  missingConfigMsg: "Missing Configuration",
  failedToFindArguments: "Failed to find argument"
};

module.exports = {
  consts,
};
