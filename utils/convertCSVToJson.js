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

function mountJsonObj(headers, values) {
  const obj = {};

  headers.forEach((header, headerIndex) => {
    obj[header.trim().replace(/"/g, "")] = values[headerIndex]
      .trim()
      .replace(/"/g, "");
  });

  return obj
}

function convertCSVToJson(filePath, isVerbose, separator = ",") {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
        logError(err);
        return;
      }
      logInfo("Loaded csv file", isVerbose);

      const rows = data.trim().split("\n");

      let headers = rows[0].split(`"${separator}"`);

      const objs = rows.slice(1).map((row, rowIndex) => {
        if (rowIndex === rows.length - 2) {
          return;
        }

        const values = row.split(`"${separator}"`);

        const obj = mountJsonObj(headers, values)

        return obj;
      });

      logInfo("Converted csv to json", isVerbose);

      resolve(objs);
    });
  });
}

module.exports = {
  convertCSVToJson,
};
