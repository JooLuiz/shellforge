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

const { consts } = require("./consts");
const { logger } = require("./logger");

const logError = logger("error", consts.identification.getArgValue);

function getArgValue(argContent, validationType, isMandatory = false) {
  let argIndex;
  process.argv.forEach((arg, index) => {
    if (validationType == "equals") {
      if (arg === argContent) argIndex = index;
    } else if (validationType == "contains") {
      if (arg.includes(argContent)) argIndex = index;
    }
  });

  if (argIndex) return process.argv[argIndex];
  else if (isMandatory) {
    logError(consts.failedToFindArguments);
    throw new Error(consts.failedToFindArguments);
  } else return "";
}

module.exports = {
  getArgValue,
};
