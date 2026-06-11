export const SUPPORTED_ACTION_TYPES = [
  "navigate",
  "type",
  "click",
  "wait",
  "waitForPageState",
  "setWebStorage",
  "closeBrowser",
  "forEachElement",
  "forEach",
  "apiRequest",
  "setVariable",
  "shell",
  "getArguments",
  "invokeAction",
  "tryCatch",
  "ifElse",
  "writeFile",
] as const;

export const DEFAULT_NEW_STEP_TYPE = SUPPORTED_ACTION_TYPES[0];

export const BROWSER_STEP_ACTIONS = [
  "navigate",
  "type",
  "click",
  "waitForPageState",
  "setWebStorage",
  "closeBrowser",
  "forEachElement",
] as const;

export const BROWSER_STEP_ACTION_SET = new Set<string>(BROWSER_STEP_ACTIONS);
