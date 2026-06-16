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

const fs = require("node:fs");
const path = require("node:path");
const { getPackagedUserDataRoot } = require("./shellforgePaths");

function getRuntimeRoot() {
  return path.resolve(__dirname, "..");
}

function hasConfigAtRoot(rootPath) {
  const configPath = path.join(rootPath, "config", "config.json");
  return fs.existsSync(configPath);
}

function resolveUserDataRootFromInputs({
  envUserDataRoot,
  runtimeRoot,
  appDataPath,
}) {
  if (typeof envUserDataRoot === "string" && envUserDataRoot.trim().length > 0) {
    return path.resolve(envUserDataRoot.trim());
  }

  const resolvedRuntimeRoot = path.resolve(runtimeRoot);
  if (hasConfigAtRoot(resolvedRuntimeRoot)) {
    return resolvedRuntimeRoot;
  }

  if (typeof appDataPath === "string" && appDataPath.trim().length > 0) {
    return getPackagedUserDataRoot(appDataPath.trim());
  }

  return resolvedRuntimeRoot;
}

function resolveUserDataRoot() {
  return resolveUserDataRootFromInputs({
    envUserDataRoot: process.env.SHELLFORGE_USER_DATA,
    runtimeRoot: getRuntimeRoot(),
    appDataPath: process.env.APPDATA,
  });
}

function readConfigFile(configPath) {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found at ${configPath}`);
  }

  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

async function getConfigs() {
  const configPath = path.join(resolveUserDataRoot(), "config", "config.json");
  return readConfigFile(configPath);
}

module.exports = {
  getConfigs,
  resolveUserDataRoot,
  resolveUserDataRootFromInputs,
};
