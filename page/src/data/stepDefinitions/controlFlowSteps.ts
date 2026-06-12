import type { StepDocEntry } from "./types";

export const controlFlowStepDefinitions: StepDocEntry[] = [
  {
    action: "forEach",
    category: "controlFlow",
    nestedKeys: ["steps"],
    fields: [
      { key: "list", type: "json", required: "oneOf", interpolation: true, example: '["apple", "banana"]' },
      { key: "count", type: "number", required: "oneOf", interpolation: false, example: "5" },
      { key: "steps", type: "step[]", required: "yes", interpolation: false },
    ],
    exampleJson: `{ "action": "forEach", "list": "{{context.userIds}}", "steps": [{ "action": "wait", "ms": 500 }] }`,
  },
  {
    action: "invokeAction",
    category: "controlFlow",
    fields: [
      { key: "name", type: "string", required: "yes", interpolation: false, example: "loginAction" },
      { key: "args", type: "object", required: "no", interpolation: false, example: '{ "username": "{{context.user}}" }' },
      { key: "continueOnError", type: "boolean", required: "no", interpolation: false },
      { key: "storeAs", type: "string", required: "no", interpolation: false, example: "loginResult" },
    ],
    exampleJson: `{ "action": "invokeAction", "name": "perform-api-request", "args": { "message": "done" } }`,
  },
  {
    action: "tryCatch",
    category: "controlFlow",
    nestedKeys: ["try", "catch", "finally"],
    fields: [
      { key: "try", type: "step[]", required: "yes", interpolation: false },
      { key: "catch", type: "step[]", required: "no", interpolation: false },
      { key: "finally", type: "step[]", required: "no", interpolation: false },
    ],
    exampleJson: `{ "action": "tryCatch", "try": [{ "action": "shell", "command": "risky" }], "catch": [] }`,
  },
  {
    action: "ifElse",
    category: "controlFlow",
    nestedKeys: ["then", "else"],
    fields: [
      { key: "left", type: "string", required: "yes", interpolation: false, example: "{{context.retries}}" },
      { key: "operator", type: "enum", required: "yes", interpolation: false, example: "lt" },
      { key: "right", type: "string", required: "conditional", interpolation: false, example: "3" },
      { key: "then", type: "step[]", required: "yes", interpolation: false },
      { key: "else", type: "step[]", required: "no", interpolation: false },
    ],
    exampleJson: `{ "action": "ifElse", "left": "{{context.retries}}", "operator": "lt", "right": "3", "then": [] }`,
  },
];

export const actionLevelFields = [
  {
    key: "browserProfile",
    type: "string",
    required: "no" as const,
    interpolation: false,
    example: "my-app-profile",
  },
];
