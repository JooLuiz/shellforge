const { getConfigs, logger, getArgValue, consts, createPuppeteerBrowser } = require("../utils");
const { normalizeSteps } = require("./normalizeSteps");
const { runSteps } = require("./runSteps");

const isVerbose = getArgValue("--verbose", "equals");

const actionArgument = getArgValue("action=", "contains", true);

const logInfo = (data) => {
  if (isVerbose) {
    logger("info", consts.identification.browserAutomation)(data);
  }
};

const logError = logger("error", consts.identification.browserAutomation);

if (!actionArgument) {
  logError(consts.missingActionMsg);
  throw new Error(consts.missingActionMsg);
}

function getAction(action) {
  return action.replace("action=", "");
}

async function browserAutomation() {
  const configs = await getConfigs();

  if (!configs) {
    logError(consts.missingConfigMsg);
    throw new Error(consts.missingConfigMsg);
  }

  const action = getAction(actionArgument);

  if (!configs.browserAutomation[action]) {
    logError(consts.missingConfigMsg);
    throw new Error(consts.missingConfigMsg);
  }

  const actionConfig = configs.browserAutomation[action];
  const steps = normalizeSteps(actionConfig, action);

  logInfo("Config successfully loaded");

  const browser = await createPuppeteerBrowser(isVerbose);
  const page = await browser.newPage();

  await page.setViewport({
    width: 1540,
    height: 700,
  });

  logInfo("Opened Default Browser");

  await runSteps(browser, page, steps, logInfo);

  logInfo("All steps completed");
}

browserAutomation();
