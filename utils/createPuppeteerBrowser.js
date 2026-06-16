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

const puppeteer = require("puppeteer");
const { logger } = require("./logger");
const { consts } = require("./consts");

const logError = logger("error", consts.identification.createPuppeteerBrowser);
const logInfo = (data, isVerbose) => {
  if (isVerbose) {
    logger("info", consts.identification.createPuppeteerBrowser)(data);
  }
};

const DEFAULT_LAUNCH_ARGS = ["--start-maximized", "--no-sandbox", "--disable-setuid-sandbox"];

function toErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function getConfiguredExecutablePath(env = process.env) {
  const executablePath = env.PUPPETEER_EXECUTABLE_PATH ?? env.CHROME_PATH;
  return typeof executablePath === "string" && executablePath.trim().length > 0
    ? executablePath.trim()
    : null;
}

function sanitizeLaunchOverrides(launchOverrides = {}) {
  if (!launchOverrides || typeof launchOverrides !== "object") {
    return {};
  }

  const sanitizedOverrides = {};

  if (
    typeof launchOverrides.userDataDir === "string" &&
    launchOverrides.userDataDir.trim().length > 0
  ) {
    sanitizedOverrides.userDataDir = launchOverrides.userDataDir.trim();
  }

  return sanitizedOverrides;
}

function mergeLaunchOptionsWithOverrides(launchAttempts, launchOverrides) {
  const sanitizedOverrides = sanitizeLaunchOverrides(launchOverrides);

  if (Object.keys(sanitizedOverrides).length === 0) {
    return launchAttempts;
  }

  return launchAttempts.map((launchAttempt) => ({
    ...launchAttempt,
    options: {
      ...launchAttempt.options,
      ...sanitizedOverrides,
    },
  }));
}

function buildLaunchAttempts(env = process.env, launchOverrides = {}) {
  const launchAttempts = [
    {
      name: "default",
      options: {
        headless: false,
        args: [...DEFAULT_LAUNCH_ARGS],
      },
    },
    {
      name: "chrome-channel",
      options: {
        headless: false,
        channel: "chrome",
        args: [...DEFAULT_LAUNCH_ARGS],
      },
    },
  ];

  const executablePath = getConfiguredExecutablePath(env);
  if (executablePath) {
    launchAttempts.push({
      name: "env-executable",
      options: {
        headless: false,
        executablePath,
        args: [...DEFAULT_LAUNCH_ARGS],
      },
    });
  }

  return mergeLaunchOptionsWithOverrides(launchAttempts, launchOverrides);
}

function createBrowserLaunchError(attemptFailures) {
  const details = attemptFailures
    .map((attemptFailure) => `${attemptFailure.name}: ${attemptFailure.message}`)
    .join(" | ");
  const errorMessage = `[Action Runner] Failed to start Puppeteer browser after ${attemptFailures.length} attempt(s). ${details}. Configure CHROME_PATH or PUPPETEER_EXECUTABLE_PATH if needed.`;
  return new Error(errorMessage);
}

async function launchWithAttempts(launchFn, launchAttempts, isVerbose, handleDisconnect) {
  const attemptFailures = [];

  for (const launchAttempt of launchAttempts) {
    try {
      logInfo(`Creating Puppeteer Browser (${launchAttempt.name})`, isVerbose);
      const browser = await launchFn(launchAttempt.options);

      if (handleDisconnect) {
        browser.on("disconnected", handleDisconnect);
      }

      return browser;
    } catch (error) {
      const errorMessage = toErrorMessage(error);
      attemptFailures.push({
        name: launchAttempt.name,
        message: errorMessage,
      });
      logError(`Failed to Start Puppeteer Browser (${launchAttempt.name}): ${errorMessage}`);
    }
  }

  throw createBrowserLaunchError(attemptFailures);
}

async function createPuppeteerBrowser(
  isVerbose,
  handleDisconnect,
  launchOverrides = {}
) {
  const launchAttempts = buildLaunchAttempts(process.env, launchOverrides);
  return launchWithAttempts(
    (launchOptions) => puppeteer.launch(launchOptions),
    launchAttempts,
    isVerbose,
    handleDisconnect
  );
}

module.exports = {
  createPuppeteerBrowser,
  buildLaunchAttempts,
  launchWithAttempts,
  createBrowserLaunchError,
};
