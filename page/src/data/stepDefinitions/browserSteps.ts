import type { StepDocEntry } from "./types";

export const browserStepDefinitions: StepDocEntry[] = [
  {
    action: "navigate",
    category: "browser",
    fields: [
      { key: "url", type: "string", required: "yes", interpolation: true, example: "https://example.com/login" },
      { key: "waitForLoading", type: "boolean", required: "no", interpolation: false },
    ],
    exampleJson: `{ "action": "navigate", "url": "https://example.com/login", "waitForLoading": true }`,
  },
  {
    action: "type",
    category: "browser",
    fields: [
      { key: "selector", type: "string", required: "yes", interpolation: false, example: "#username" },
      { key: "value", type: "string", required: "yes", interpolation: true, example: "{{context.username}}" },
      { key: "delay", type: "number", required: "no", interpolation: false, example: "50" },
      { key: "iframe", type: "string", required: "no", interpolation: false, example: "iframe#content-frame" },
    ],
    exampleJson: `{ "action": "type", "selector": "#username", "value": "user@example.com" }`,
  },
  {
    action: "click",
    category: "browser",
    fields: [
      { key: "selector", type: "string", required: "yes", interpolation: false, example: "button.submit" },
      { key: "waitForSelector", type: "string", required: "no", interpolation: false, example: ".modal-confirm" },
      { key: "waitForNavigation", type: "boolean", required: "no", interpolation: false },
      { key: "waitForLoading", type: "boolean", required: "no", interpolation: false },
      { key: "timeout", type: "number", required: "no", interpolation: false, example: "5000" },
      { key: "iframe", type: "string", required: "no", interpolation: false },
      { key: "jsClick", type: "boolean", required: "no", interpolation: false },
    ],
    exampleJson: `{ "action": "click", "selector": "#loginbtn", "waitForNavigation": true }`,
  },
  {
    action: "waitForPageState",
    category: "browser",
    fields: [
      { key: "selector", type: "string", required: "oneOf", interpolation: false, example: ".dashboard-header" },
      { key: "urlContains", type: "string", required: "oneOf", interpolation: true, example: "/dashboard" },
      { key: "waitForLoading", type: "boolean", required: "oneOf", interpolation: false },
      { key: "timeout", type: "number", required: "no", interpolation: false, example: "10000" },
      { key: "iframe", type: "string", required: "conditional", interpolation: false },
    ],
    exampleJson: `{ "action": "waitForPageState", "selector": ".data-grid", "timeout": 10000 }`,
  },
  {
    action: "setWebStorage",
    category: "browser",
    fields: [
      { key: "localStorage", type: "object", required: "oneOf", interpolation: false, example: '{ "token": "abc123" }' },
      { key: "sessionStorage", type: "object", required: "oneOf", interpolation: false },
      { key: "cookies", type: "json", required: "oneOf", interpolation: false },
    ],
    exampleJson: `{ "action": "setWebStorage", "localStorage": { "token": "your-jwt-token" } }`,
  },
  {
    action: "closeBrowser",
    category: "browser",
    fields: [],
    exampleJson: `{ "action": "closeBrowser" }`,
  },
  {
    action: "forEachElement",
    category: "browser",
    nestedKeys: ["steps"],
    fields: [
      { key: "selector", type: "string", required: "yes", interpolation: false, example: ".product-row" },
      { key: "steps", type: "step[]", required: "yes", interpolation: false },
      { key: "textContentSelector", type: "string", required: "no", interpolation: false, example: ".product-name" },
      { key: "excludeTextPatterns", type: "string[]", required: "no", interpolation: false, example: "Loading..." },
      { key: "clickSelector", type: "string", required: "no", interpolation: false, example: "button.details" },
      { key: "skipIfPositionMatch", type: "object", required: "no", interpolation: false },
    ],
    exampleJson: `{ "action": "forEachElement", "selector": ".data-row", "steps": [{ "action": "click", "selector": ".row-actions" }] }`,
  },
];
