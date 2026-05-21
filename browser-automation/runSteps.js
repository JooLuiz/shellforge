const { stepHandlers } = require("./stepHandlers");

async function runSteps(browser, page, steps, logInfo) {
  let activePage = page;

  for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
    const step = steps[stepIndex];
    const stepNumber = stepIndex + 1;
    const handler = stepHandlers[step.action];

    logInfo(`Running step ${stepNumber}: ${step.action}`);

    activePage = await handler(browser, activePage, step, (message) => {
      logInfo(`Step ${stepNumber} (${step.action}) - ${message}`);
    });
  }

  return activePage;
}

module.exports = {
  runSteps,
};
