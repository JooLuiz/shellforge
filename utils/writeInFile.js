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

const fs = require("fs");
const { consts } = require("./consts");
const { logger } = require("./logger");

const logError = logger("error", consts.identification.convertCSVToJson);
const logInfo = (data, isVerbose) => {
  if (isVerbose) {
    logger("info", consts.identification.convertCSVToJson)(data);
  }
};

function writeInFile(filePath, data, isVerbose){
  fs.writeFile(filePath, data, { encoding: "utf8" }, (err) => {
    if (err) {
      logError(`Error creating file: ${err.message}`);
    }
  });

  logInfo(`Created file`, isVerbose);
}

module.exports = {
  writeInFile
}