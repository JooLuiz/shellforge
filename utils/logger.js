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

function log(data, type = "info") {
  if (type == "info") {
    console.log("[INFO] - " + data);
  } else if (type == "error") {
    console.error("[ERROR] - " + data);
  }
}

function buildLogMessage(identification, data){
  return identification + " - " + data
}

function logger(type, identification) {
  return (data) => {
    if (type == "error") {
      log(buildLogMessage(identification, data), "error");
    } else {
      log(buildLogMessage(identification, data));
    }
  }
}

module.exports = {
  logger,
};
