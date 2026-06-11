"use strict";

/**
 * Role: Validates action step configuration and normalizes legacy login format.
 * Not in this file: Runtime interpolation and handler execution.
 * Key dependencies: Shared action step contract.
 * See also: action-runner/runSteps.js, config/config-example.json
 */

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
  waitForPageState: [],
  setWebStorage: [],
  closeBrowser: [],
  forEachElement: ["selector", "steps"],
  forEach: ["steps"],
  apiRequest: ["url"],
  setVariable: ["source", "storeAs"],
  shell: [],
  getArguments: [],
  invokeAction: ["name"],
  tryCatch: [],
  ifElse: ["left", "operator", "then"],
  writeFile: ["path", "content"],
};

const IF_ELSE_OPERATORS = new Set(["eq", "gt", "gte", "lt", "lte", "exists"]);

const FOR_EACH_ELEMENT_ALLOWED_SUB_ACTIONS = new Set([
  "navigate",
  "type",
  "click",
  "waitForPageState",
  "setWebStorage",
  "closeBrowser",
  "forEachElement",
  "wait",
  "apiRequest",
]);

function formatStepError(actionName, stepIndex, message) {
  return `[Action Runner] Action "${actionName}" step ${stepIndex}: ${message}`;
}

function validateWaitStep(step, actionName, stepIndex) {
  const hasMilliseconds =
    typeof step.ms === "number" && Number.isFinite(step.ms) && step.ms >= 0;

  if (!hasMilliseconds) {
    throw new Error(
      formatStepError(
        actionName,
        stepIndex,
        'wait step requires "ms" to be a non-negative number. Use "waitForPageState" for browser-state polling.'
      )
    );
  }
}

function validateWaitForPageStateStep(step, actionName, stepIndex) {
  const hasSelector = typeof step.selector === "string" && step.selector.length > 0;
  const hasUrlContains = typeof step.urlContains === "string" && step.urlContains.length > 0;
  const hasWaitForLoading = step.waitForLoading === true;

  if (!hasSelector && !hasUrlContains && !hasWaitForLoading) {
    throw new Error(
      formatStepError(
        actionName,
        stepIndex,
        'waitForPageState step requires at least one of "selector", "urlContains", or "waitForLoading": true'
      )
    );
  }
}

function validateSetWebStorageStep(step, actionName, stepIndex) {
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

function validateApiRequestStep(step, actionName, stepIndex) {
  if (step.auth?.type === "basic") {
    const hasUsername = typeof step.auth.username === "string" && step.auth.username.length > 0;
    const hasPassword = typeof step.auth.password === "string" && step.auth.password.length > 0;

    if (!hasUsername || !hasPassword) {
      throw new Error(
        formatStepError(
          actionName,
          stepIndex,
          'apiRequest with auth.type "basic" requires "auth.username" and "auth.password"'
        )
      );
    }
  }
}

function validateShellStep(step, actionName, stepIndex) {
  const hasCommand = typeof step.command === "string" && step.command.length > 0;
  const hasCommands = Array.isArray(step.commands) && step.commands.length > 0;

  if (!hasCommand && !hasCommands) {
    throw new Error(
      formatStepError(actionName, stepIndex, 'shell step requires "command" or "commands"')
    );
  }
}

function validateGetArgumentsStep(step, actionName, stepIndex) {
  if (step.required !== undefined && !Array.isArray(step.required)) {
    throw new Error(
      formatStepError(actionName, stepIndex, 'getArguments "required" must be an array of argument names')
    );
  }

  if (step.optional !== undefined && !Array.isArray(step.optional)) {
    throw new Error(
      formatStepError(actionName, stepIndex, 'getArguments "optional" must be an array of argument names')
    );
  }

  if (step.defaults !== undefined && (typeof step.defaults !== "object" || Array.isArray(step.defaults))) {
    throw new Error(
      formatStepError(actionName, stepIndex, 'getArguments "defaults" must be an object')
    );
  }
}

function validateForEachStep(step, actionName, stepIndex) {
  const hasList = step.list !== undefined;
  const hasCount = step.count !== undefined;

  if (hasList === hasCount) {
    throw new Error(
      formatStepError(
        actionName,
        stepIndex,
        'forEach requires exactly one of "list" (array) or "count" (positive number)'
      )
    );
  }

  if (hasList && !Array.isArray(step.list)) {
    throw new Error(
      formatStepError(actionName, stepIndex, 'forEach "list" must be an array')
    );
  }

  if (hasCount) {
    const isPositiveInteger =
      typeof step.count === "number" &&
      Number.isFinite(step.count) &&
      step.count > 0 &&
      Number.isInteger(step.count);

    if (!isPositiveInteger) {
      throw new Error(
        formatStepError(actionName, stepIndex, 'forEach "count" must be a positive integer')
      );
    }
  }

  if (!Array.isArray(step.steps) || step.steps.length === 0) {
    throw new Error(
      formatStepError(actionName, stepIndex, 'forEach requires a non-empty "steps" array')
    );
  }

  step.steps.forEach((subStep, subIndex) =>
    validateStep(subStep, actionName, `${stepIndex}.${subIndex + 1}`)
  );
}

function validateIfElseStep(step, actionName, stepIndex) {
  if (typeof step.left !== "string" || step.left.length === 0) {
    throw new Error(
      formatStepError(actionName, stepIndex, 'ifElse requires a non-empty "left" operand')
    );
  }

  if (!IF_ELSE_OPERATORS.has(step.operator)) {
    throw new Error(
      formatStepError(
        actionName,
        stepIndex,
        'ifElse "operator" must be one of: eq, gt, gte, lt, lte, exists'
      )
    );
  }

  if (step.operator !== "exists") {
    if (typeof step.right !== "string" || step.right.length === 0) {
      throw new Error(
        formatStepError(
          actionName,
          stepIndex,
          'ifElse requires a non-empty "right" operand unless operator is "exists"'
        )
      );
    }
  }

  if (!Array.isArray(step.then)) {
    throw new Error(
      formatStepError(actionName, stepIndex, 'ifElse "then" must be an array')
    );
  }

  step.then.forEach((subStep, subIndex) =>
    validateStep(subStep, actionName, `${stepIndex}.then.${subIndex + 1}`)
  );

  if (step.else !== undefined) {
    if (!Array.isArray(step.else)) {
      throw new Error(
        formatStepError(actionName, stepIndex, 'ifElse "else" must be an array')
      );
    }

    step.else.forEach((subStep, subIndex) =>
      validateStep(subStep, actionName, `${stepIndex}.else.${subIndex + 1}`)
    );
  }
}

function validateTryCatchStep(step, actionName, stepIndex) {
  if (!Array.isArray(step.try) || step.try.length === 0) {
    throw new Error(
      formatStepError(actionName, stepIndex, 'tryCatch requires a non-empty "try" array')
    );
  }

  step.try.forEach((subStep, subIndex) =>
    validateStep(subStep, actionName, `${stepIndex}.try.${subIndex + 1}`)
  );

  if (step.catch !== undefined) {
    if (!Array.isArray(step.catch)) {
      throw new Error(
        formatStepError(actionName, stepIndex, 'tryCatch "catch" must be an array')
      );
    }

    step.catch.forEach((subStep, subIndex) =>
      validateStep(subStep, actionName, `${stepIndex}.catch.${subIndex + 1}`)
    );
  }

  if (step.finally !== undefined) {
    if (!Array.isArray(step.finally)) {
      throw new Error(
        formatStepError(actionName, stepIndex, 'tryCatch "finally" must be an array')
      );
    }

    step.finally.forEach((subStep, subIndex) =>
      validateStep(subStep, actionName, `${stepIndex}.finally.${subIndex + 1}`)
    );
  }
}

function validateForEachElementStep(step, actionName, stepIndex) {
  if (!Array.isArray(step.steps) || step.steps.length === 0) {
    throw new Error(
      formatStepError(
        actionName,
        stepIndex,
        'forEachElement requires a non-empty "steps" array'
      )
    );
  }

  const allowedSubActionList = Array.from(
    FOR_EACH_ELEMENT_ALLOWED_SUB_ACTIONS
  ).join(", ");

  step.steps.forEach((subStep, subIndex) => {
    if (
      !subStep ||
      typeof subStep !== "object" ||
      typeof subStep.action !== "string" ||
      !FOR_EACH_ELEMENT_ALLOWED_SUB_ACTIONS.has(subStep.action)
    ) {
      const invalidAction =
        subStep && typeof subStep === "object" && typeof subStep.action === "string"
          ? subStep.action
          : String(subStep?.action);
      throw new Error(
        formatStepError(
          actionName,
          `${stepIndex}.${subIndex + 1}`,
          `forEachElement sub-step action "${invalidAction}" is not allowed. Allowed actions: ${allowedSubActionList}`
        )
      );
    }

    validateStep(subStep, actionName, `${stepIndex}.${subIndex + 1}`);
  });
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
        `unknown action "${step.action}". Supported: navigate, type, click, wait, waitForPageState, setWebStorage, closeBrowser, forEachElement, forEach, apiRequest, setVariable, shell, getArguments, invokeAction, tryCatch, ifElse, writeFile`
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
    validateSetWebStorageStep(step, actionName, stepIndex);
  }

  if (step.action === "wait") {
    validateWaitStep(step, actionName, stepIndex);
  }

  if (step.action === "waitForPageState") {
    validateWaitForPageStateStep(step, actionName, stepIndex);
  }

  if (step.action === "forEachElement") {
    validateForEachElementStep(step, actionName, stepIndex);
  }

  if (step.action === "apiRequest") {
    validateApiRequestStep(step, actionName, stepIndex);
  }

  if (step.action === "shell") {
    validateShellStep(step, actionName, stepIndex);
  }

  if (step.action === "getArguments") {
    validateGetArgumentsStep(step, actionName, stepIndex);
  }

  if (step.action === "tryCatch") {
    validateTryCatchStep(step, actionName, stepIndex);
  }

  if (step.action === "ifElse") {
    validateIfElseStep(step, actionName, stepIndex);
  }

  if (step.action === "forEach") {
    validateForEachStep(step, actionName, stepIndex);
  }
}

function validateSteps(steps, actionName) {
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error(`[Action Runner] Action "${actionName}" must define a non-empty "steps" array`);
  }

  steps.forEach((step, index) => validateStep(step, actionName, index + 1));
}

function buildLegacySteps(actionConfig) {
  const missingField = LEGACY_FIELDS.find(
    (field) => actionConfig[field] === undefined || actionConfig[field] === ""
  );

  if (missingField) {
    throw new Error(`[Action Runner] Legacy action config missing field "${missingField}"`);
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
