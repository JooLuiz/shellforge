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
 * Role: Writes content to a file from action steps, avoiding shell command size limits.
 * Not in this file: Shell execution or API requests.
 * Key dependencies: Node.js fs and path modules, runtime context storage.
 * See also: action-runner/runSteps.js, action-runner/handlers/shellHandler.js
 */

const fs = require("node:fs");
const path = require("node:path");

function buildBackupFilePath(filePath) {
  const timestamp = new Date().toISOString().replace(/[:]/g, "-").replace("T", "-").split(".")[0];
  const extension = path.extname(filePath);
  const fileNameWithoutExtension = path.basename(filePath, extension);
  const parentDirectoryPath = path.dirname(filePath);

  return path.join(parentDirectoryPath, `${fileNameWithoutExtension}-old-${timestamp}${extension}`);
}

async function handleWriteFile(_resources, step, logInfo, runtimeContext) {
  const filePath = path.resolve(step.path);
  const content = typeof step.content === "object"
    ? JSON.stringify(step.content, null, 2)
    : String(step.content);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  if (step.backupIfExists === true && fs.existsSync(filePath)) {
    const backupFilePath = buildBackupFilePath(filePath);
    fs.renameSync(filePath, backupFilePath);
    logInfo(`Backed up existing file to ${backupFilePath}`);
  }

  fs.writeFileSync(filePath, content, "utf8");
  logInfo(`Wrote ${content.length} chars to ${filePath}`);

  if (typeof step.storeAs === "string" && step.storeAs.length > 0) {
    runtimeContext[step.storeAs] = filePath;
    logInfo(`Stored file path in context.${step.storeAs}`);
  }

  return null;
}

module.exports = {
  handleWriteFile,
};
