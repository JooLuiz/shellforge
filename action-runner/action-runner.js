"use strict";

/**
 * Role: Main CLI entry point for config-driven browser, API, and shell automation.
 * Not in this file: Step-specific implementation and low-level page resilience.
 * Key dependencies: utils config/logger/browser factory, normalizeSteps and runSteps.
 * See also: action-runner/normalizeSteps.js, action-runner/runSteps.js
 */

const { getConfigs, logger, getArgValue, consts, createPuppeteerBrowser } = require("../utils");
const { normalizeSteps } = require("./normalizeSteps");
const { runSteps } = require("./runSteps");

const CLI_ARG_PREFIX = "--arg.";

const DEFAULT_VIEWPORT = {
  width: 1540,
  height: 700,
};

const isVerbose = getArgValue("--verbose", "equals");
const actionArgument = getArgValue("action=", "contains", true);

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

const logInfo = (data) => {
  if (isVerbose) {
    logger("info", consts.identification.actionRunner)(data);
  }
};

const logError = logger("error", consts.identification.actionRunner);

if (!actionArgument) {
  logError(consts.missingActionMsg);
  throw new Error(consts.missingActionMsg);
}

function getAction(action) {
  const match = action.match(/(?:--)?action=(.+)/);
  return match ? match[1] : action;
}

function createResources(isVerboseMode, loggerInfo) {
  let browserInstance = null;
  let pageInstance = null;

  async function getBrowser() {
    if (!browserInstance || !browserInstance.isConnected()) {
      browserInstance = await createPuppeteerBrowser(isVerboseMode);
      pageInstance = null;
    }

    return browserInstance;
  }

  async function getPage() {
    if (pageInstance && !pageInstance.isClosed()) {
      return pageInstance;
    }

    const browser = await getBrowser();
    pageInstance = await browser.newPage();
    await pageInstance.setViewport(DEFAULT_VIEWPORT);
    loggerInfo("Opened Default Browser");
    return pageInstance;
  }

  function setPage(nextPage) {
    pageInstance = nextPage;
  }

  async function closeBrowser() {
    if (browserInstance && browserInstance.isConnected()) {
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

async function actionRunner() {
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

  const steps = normalizeSteps(actionConfig, action);
  const resources = createResources(isVerbose, logInfo);

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

actionRunner().catch((error) => {
  logError(error.message);
  process.exitCode = 1;
});
