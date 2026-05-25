import type { StepFieldDefinition } from "./types";

export const SUPPORTED_ACTION_TYPES = [
  "navigate",
  "type",
  "click",
  "wait",
  "setWebStorage",
  "closeBrowser",
  "forEachElement",
  "apiRequest",
  "extractVariable",
  "shell",
  "getArguments",
  "invokeAction",
  "tryCatch",
  "writeFile",
];

export const STEP_FIELD_DEFINITIONS: Record<string, StepFieldDefinition[]> = {
  navigate: [{ key: "url", label: "URL", type: "string" }],
  type: [
    { key: "selector", label: "Selector", type: "string" },
    { key: "value", label: "Value", type: "string" },
    { key: "delay", label: "Delay", type: "number" },
  ],
  click: [
    { key: "selector", label: "Selector", type: "string" },
    { key: "waitForSelector", label: "Wait for selector", type: "string" },
    { key: "waitForNavigation", label: "Wait for navigation", type: "boolean" },
    { key: "waitForLoading", label: "Wait for loading", type: "boolean" },
    { key: "timeout", label: "Timeout (ms)", type: "number" },
    { key: "iframe", label: "IFrame selector", type: "string" },
    { key: "jsClick", label: "Use JS click", type: "boolean" },
  ],
  wait: [
    { key: "ms", label: "Milliseconds", type: "number" },
    { key: "selector", label: "Selector", type: "string" },
    { key: "urlContains", label: "URL contains", type: "string" },
    { key: "timeout", label: "Timeout (ms)", type: "number" },
    { key: "waitForLoading", label: "Wait for loading", type: "boolean" },
  ],
  setWebStorage: [
    { key: "localStorage", label: "Local storage", type: "object" },
    { key: "sessionStorage", label: "Session storage", type: "object" },
    { key: "cookies", label: "Cookies (JSON array)", type: "json" },
  ],
  closeBrowser: [],
  forEachElement: [
    { key: "selector", label: "Selector", type: "string" },
    {
      key: "textContentSelector",
      label: "Text content selector",
      type: "string",
    },
    {
      key: "excludeTextPatterns",
      label: "Exclude text patterns",
      type: "stringArray",
    },
    { key: "clickSelector", label: "Click selector", type: "string" },
    {
      key: "skipIfPositionMatch",
      label: "Skip position match",
      type: "object",
    },
    { key: "steps", label: "Steps (JSON array)", type: "json" },
  ],
  apiRequest: [
    { key: "method", label: "Method", type: "string" },
    { key: "url", label: "URL", type: "string" },
    { key: "params", label: "Params", type: "object" },
    { key: "headers", label: "Headers", type: "object" },
    { key: "auth", label: "Auth", type: "object" },
    { key: "body", label: "Body (JSON)", type: "json" },
    { key: "storeAs", label: "Store as", type: "string" },
    { key: "timeout", label: "Timeout (ms)", type: "number" },
    { key: "ignoreHttpErrors", label: "Ignore HTTP errors", type: "boolean" },
  ],
  extractVariable: [
    { key: "source", label: "Source", type: "string" },
    { key: "storeAs", label: "Store as", type: "string" },
  ],
  shell: [
    { key: "command", label: "Command", type: "string" },
    { key: "commands", label: "Commands", type: "stringArray" },
    { key: "shellArgs", label: "Shell args", type: "stringArray" },
    { key: "cwd", label: "Working directory", type: "string" },
    { key: "storeAs", label: "Store as", type: "string" },
    { key: "timeout", label: "Timeout (ms)", type: "number" },
  ],
  getArguments: [
    { key: "required", label: "Required args", type: "stringArray" },
    { key: "optional", label: "Optional args", type: "stringArray" },
    { key: "defaults", label: "Defaults", type: "object" },
  ],
  invokeAction: [
    { key: "name", label: "Action name", type: "string" },
    { key: "args", label: "Args", type: "object" },
    { key: "continueOnError", label: "Continue on error", type: "boolean" },
    { key: "storeAs", label: "Store as", type: "string" },
  ],
  tryCatch: [
    { key: "try", label: "Try steps (JSON array)", type: "json" },
    { key: "catch", label: "Catch steps (JSON array)", type: "json" },
    { key: "finally", label: "Finally steps (JSON array)", type: "json" },
  ],
  writeFile: [
    { key: "path", label: "Path", type: "string" },
    { key: "content", label: "Content", type: "string" },
    { key: "backupIfExists", label: "Backup if exists", type: "boolean" },
    { key: "storeAs", label: "Store as", type: "string" },
  ],
};
