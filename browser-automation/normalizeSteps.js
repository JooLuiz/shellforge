const LEGACY_FIELDS = [
  "url",
  "usernameInput",
  "usernameValue",
  "passwordInput",
  "passwordValue",
  "loginButton",
];

const STEP_REQUIRED_FIELDS = {
  navigate: ["url"],
  type: ["selector", "value"],
  click: ["selector"],
  wait: [],
  setWebStorage: [],
  closeBrowser: [],
  forEachElement: ["selector", "steps"],
};

function formatStepError(actionName, stepIndex, message) {
  return `[Browser Automation] Action "${actionName}" step ${stepIndex}: ${message}`;
}

function validateStep(step, actionName, stepIndex) {
  if (!step || typeof step !== "object") {
    throw new Error(formatStepError(actionName, stepIndex, "step must be an object"));
  }

  if (!step.action || typeof step.action !== "string") {
    throw new Error(formatStepError(actionName, stepIndex, 'missing or invalid "action"'));
  }

  const requiredFields = STEP_REQUIRED_FIELDS[step.action];

  if (!requiredFields) {
    throw new Error(
      formatStepError(
        actionName,
        stepIndex,
        `unknown action "${step.action}". Supported: navigate, type, click, wait, setWebStorage, closeBrowser, forEachElement`
      )
    );
  }

  for (const field of requiredFields) {
    if (step[field] === undefined || step[field] === "") {
      throw new Error(
        formatStepError(actionName, stepIndex, `missing required field "${field}" for action "${step.action}"`)
      );
    }
  }

  if (step.action === "setWebStorage") {
    const hasLocalStorage = step.localStorage && typeof step.localStorage === "object";
    const hasSessionStorage = step.sessionStorage && typeof step.sessionStorage === "object";
    const hasCookies = Array.isArray(step.cookies) && step.cookies.length > 0;

    if (!hasLocalStorage && !hasSessionStorage && !hasCookies) {
      throw new Error(
        formatStepError(
          actionName,
          stepIndex,
          'setWebStorage step requires at least one of "localStorage", "sessionStorage", or "cookies"'
        )
      );
    }
  }

  if (step.action === "wait") {
    const hasMilliseconds = typeof step.ms === "number" && step.ms >= 0;
    const hasSelector = typeof step.selector === "string" && step.selector.length > 0;
    const hasUrlContains = typeof step.urlContains === "string" && step.urlContains.length > 0;
    const hasWaitForLoading = step.waitForLoading === true;

    if (!hasMilliseconds && !hasSelector && !hasUrlContains && !hasWaitForLoading) {
      throw new Error(
        formatStepError(
          actionName,
          stepIndex,
          'wait step requires "ms", "selector", "urlContains", or "waitForLoading": true'
        )
      );
    }
  }

  if (step.action === "forEachElement") {
    if (!Array.isArray(step.steps) || step.steps.length === 0) {
      throw new Error(
        formatStepError(
          actionName,
          stepIndex,
          'forEachElement requires a non-empty "steps" array'
        )
      );
    }

    step.steps.forEach((subStep, subIndex) =>
      validateStep(subStep, actionName, `${stepIndex}.${subIndex + 1}`)
    );
  }
}

function validateSteps(steps, actionName) {
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error(`[Browser Automation] Action "${actionName}" must define a non-empty "steps" array`);
  }

  steps.forEach((step, index) => validateStep(step, actionName, index + 1));
}

function buildLegacySteps(actionConfig) {
  const missingField = LEGACY_FIELDS.find(
    (field) => actionConfig[field] === undefined || actionConfig[field] === ""
  );

  if (missingField) {
    throw new Error(`[Browser Automation] Legacy action config missing field "${missingField}"`);
  }

  return [
    { action: "navigate", url: actionConfig.url },
    { action: "type", selector: actionConfig.usernameInput, value: actionConfig.usernameValue },
    { action: "type", selector: actionConfig.passwordInput, value: actionConfig.passwordValue },
    { action: "click", selector: actionConfig.loginButton },
  ];
}

function normalizeSteps(actionConfig, actionName) {
  if (actionConfig.steps) {
    validateSteps(actionConfig.steps, actionName);
    return actionConfig.steps;
  }

  return buildLegacySteps(actionConfig);
}

module.exports = {
  normalizeSteps,
  formatStepError,
};
