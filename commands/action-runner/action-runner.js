"use strict";

/**
 * Role: Main CLI entry point for config-driven browser, API, and shell automation.
 * Not in this file: Step-specific implementation and low-level page resilience.
 * Key dependencies: utils config/logger/browser factory, normalizeSteps and runSteps.
 * See also: action-runner/normalizeSteps.js, action-runner/runSteps.js
 */

const { getConfigs, logger, getArgValue, consts, createPuppeteerBrowser } = require("../../utils");
const { resolveUserDataRoot } = require("../../utils/getConfig");
const { normalizeSteps } = require("./normalizeSteps");
const { runSteps } = require("./runSteps");
const fs = require("fs");
const path = require("path");

const CLI_ARG_PREFIX = "--arg.";

const DEFAULT_VIEWPORT = {
  width: 1540,
  height: 700,
};
const PROFILE_BASE_DIRECTORY = ".shellforge-browser-profiles";

const logError = logger("error", consts.identification.actionRunner);

function parseCliArgs() {
  const parsedArgs = {};

  process.argv.forEach((rawArg) => {
    if (!rawArg.startsWith(CLI_ARG_PREFIX)) {
      return;
    }

    const argWithoutPrefix = rawArg.slice(CLI_ARG_PREFIX.length);
    const separatorIndex = argWithoutPrefix.indexOf("=");

    if (separatorIndex === -1) {
      parsedArgs[argWithoutPrefix] = "true";
      return;
    }

    const argName = argWithoutPrefix.slice(0, separatorIndex);
    const argValue = argWithoutPrefix.slice(separatorIndex + 1);

    if (argName.length > 0) {
      parsedArgs[argName] = argValue;
    }
  });

  return parsedArgs;
}

function toErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function createInfoLogger(isVerbose) {
  return (data) => {
    if (isVerbose) {
      logger("info", consts.identification.actionRunner)(data);
    }
  };
}

function readRuntimeFlags() {
  return {
    isVerbose: Boolean(getArgValue("--verbose", "equals")),
    actionArgument: getArgValue("action=", "contains", true),
  };
}

function isConnectedBrowser(browserInstance) {
  return Boolean(
    browserInstance &&
      typeof browserInstance.isConnected === "function" &&
      browserInstance.isConnected()
  );
}

function getAction(action) {
  const match = action.match(/(?:--)?action=(.+)/);
  return match ? match[1] : action;
}

function validateBrowserProfileName(browserProfile, actionName) {
  if (typeof browserProfile !== "string") {
    return;
  }

  const profileName = browserProfile.trim();
  if (profileName.length === 0) {
    throw new Error(
      `[Action Runner] Action "${actionName}" has invalid "browserProfile": value cannot be empty.`
    );
  }

  if (profileName.includes("/") || profileName.includes("\\")) {
    throw new Error(
      `[Action Runner] Action "${actionName}" has invalid "browserProfile": use only a profile key (for example "clockify"), not a path.`
    );
  }

  if (profileName.includes("..")) {
    throw new Error(
      `[Action Runner] Action "${actionName}" has invalid "browserProfile": ".." is not allowed.`
    );
  }
}

function getBrowserLaunchOverrides(
  actionConfig,
  actionName,
  projectRoot = resolveUserDataRoot()
) {
  if (!actionConfig || typeof actionConfig !== "object") {
    return {};
  }

  if (actionConfig.browserProfile === undefined) {
    return {};
  }

  validateBrowserProfileName(actionConfig.browserProfile, actionName);
  const browserProfileName = actionConfig.browserProfile.trim();
  return {
    userDataDir: path.resolve(
      projectRoot,
      PROFILE_BASE_DIRECTORY,
      browserProfileName
    ),
  };
}

function assertUnsupportedBrowserProfileDir(actionConfig, actionName) {
  if (
    actionConfig &&
    typeof actionConfig === "object" &&
    actionConfig.browserProfileDir !== undefined
  ) {
    throw new Error(
      `[Action Runner] Action "${actionName}" uses deprecated "browserProfileDir". Use "browserProfile" instead (for example "clockify").`
    );
  }
}

function ensureBrowserProfileDirectoryExists(browserLaunchOverrides) {
  if (
    !browserLaunchOverrides ||
    typeof browserLaunchOverrides.userDataDir !== "string" ||
    browserLaunchOverrides.userDataDir.trim().length === 0
  ) {
    return;
  }

  try {
    fs.mkdirSync(browserLaunchOverrides.userDataDir, { recursive: true });
  } catch (error) {
    throw new Error(
      `[Action Runner] Failed to create browser profile directory "${browserLaunchOverrides.userDataDir}": ${toErrorMessage(error)}`,
      { cause: error },
    );
  }
}

function createResources(
  isVerboseMode,
  loggerInfo,
  browserFactory = createPuppeteerBrowser,
  browserLaunchOverrides = {}
) {
  let browserInstance = null;
  let pageInstance = null;

  async function getBrowser() {
    if (!isConnectedBrowser(browserInstance)) {
      try {
        browserInstance = await browserFactory(
          isVerboseMode,
          () => {
            browserInstance = null;
            pageInstance = null;
          },
          browserLaunchOverrides
        );
      } catch (error) {
        throw new Error(
          `[Action Runner] Failed to initialize browser. ${toErrorMessage(error)}`,
          { cause: error },
        );
      }
      pageInstance = null;
    }

    if (!browserInstance || typeof browserInstance.newPage !== "function") {
      throw new Error(
        "[Action Runner] Browser launch failed. Browser instance is unavailable."
      );
    }

    return browserInstance;
  }

  async function getPage() {
    if (
      pageInstance &&
      typeof pageInstance.isClosed === "function" &&
      !pageInstance.isClosed()
    ) {
      return pageInstance;
    }

    const browser = await getBrowser();
    if (!browser || typeof browser.newPage !== "function") {
      throw new Error(
        "[Action Runner] Browser page creation failed. Browser instance is invalid."
      );
    }

    pageInstance = await browser.newPage();
    await pageInstance.setViewport(DEFAULT_VIEWPORT);
    loggerInfo("Opened Default Browser");
    return pageInstance;
  }

  function setPage(nextPage) {
    pageInstance = nextPage;
  }

  async function closeBrowser() {
    if (isConnectedBrowser(browserInstance)) {
      await browserInstance.close();
    }

    browserInstance = null;
    pageInstance = null;
  }

  async function dispose() {
    await closeBrowser();
  }

  return {
    getBrowser,
    getPage,
    setPage,
    closeBrowser,
    dispose,
  };
}

async function actionRunner(runtimeFlags = readRuntimeFlags()) {
  const { isVerbose, actionArgument } = runtimeFlags;
  const logInfo = createInfoLogger(isVerbose);

  if (!actionArgument) {
    logError(consts.missingActionMsg);
    throw new Error(consts.missingActionMsg);
  }

  const configs = await getConfigs();

  if (!configs || !configs.actionRunner) {
    logError(consts.missingConfigMsg);
    throw new Error(consts.missingConfigMsg);
  }

  const action = getAction(actionArgument);
  const actionConfig = configs.actionRunner[action];

  if (!actionConfig) {
    logError(consts.missingConfigMsg);
    throw new Error(consts.missingConfigMsg);
  }

  assertUnsupportedBrowserProfileDir(actionConfig, action);
  const steps = normalizeSteps(actionConfig, action);
  const browserLaunchOverrides = getBrowserLaunchOverrides(actionConfig, action);
  ensureBrowserProfileDirectoryExists(browserLaunchOverrides);
  const resources = createResources(
    isVerbose,
    logInfo,
    createPuppeteerBrowser,
    browserLaunchOverrides
  );

  resources.configs = configs;
  resources.runSteps = runSteps;
  resources.normalizeSteps = normalizeSteps;
  resources.logInfo = logInfo;

  const runtimeContext = {
    inputArgs: parseCliArgs(),
  };

  logInfo("Config successfully loaded");

  try {
    await runSteps(resources, steps, logInfo, runtimeContext);
    logInfo("All steps completed");
  } finally {
    await resources.dispose();
  }
}

if (require.main === module) {
  actionRunner().catch((error) => {
    logError(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  actionRunner,
  createResources,
  parseCliArgs,
  getAction,
  assertUnsupportedBrowserProfileDir,
  validateBrowserProfileName,
  getBrowserLaunchOverrides,
  ensureBrowserProfileDirectoryExists,
  readRuntimeFlags,
};
