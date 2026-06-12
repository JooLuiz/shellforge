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
