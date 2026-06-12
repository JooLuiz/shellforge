import type { ActionStep } from "../../../../../shared/types";
import type { StepFieldDefinition } from "../../types";

export const browserAutomationStepFields: Record<string, StepFieldDefinition[]> = {
  waitForPageState: [
    {
      key: "selector",
      label: "Selector",
      type: "string",
      hint: "Wait until this element is visible on the page",
      example: ".dashboard-header",
    },
    {
      key: "urlContains",
      label: "URL contains",
      type: "string",
      supportsInterpolation: true,
      hint: "Wait until the current URL contains this substring",
      example: "/dashboard",
    },
    {
      key: "waitForLoading",
      label: "Wait for loading",
      type: "boolean",
      hint: "Wait for loading overlays to disappear before continuing",
    },
    {
      key: "timeout",
      label: "Timeout (ms)",
      type: "number",
      hint: "Max time to wait for the condition, in milliseconds",
      example: "10000",
    },
    {
      key: "iframe",
      label: "IFrame selector",
      type: "string",
      hint: "CSS selector for the iframe to search within",
      example: "iframe#content-frame",
      visibleWhen: (step: ActionStep) =>
        typeof step.selector === "string" && (step.selector as string).length > 0,
    },
  ],
  setWebStorage: [
    {
      key: "localStorage",
      label: "Local storage",
      type: "object",
      hint: "Key-value pairs to write into localStorage",
      example: "token: abc123",
    },
    {
      key: "sessionStorage",
      label: "Session storage",
      type: "object",
      hint: "Key-value pairs to write into sessionStorage",
      example: "sessionId: xyz",
    },
    {
      key: "cookies",
      label: "Cookies (JSON array)",
      type: "json",
      hint: "Array of cookie objects accepted by Puppeteer's setCookie",
      example: '[{ "name": "token", "value": "abc", "domain": ".example.com" }]',
    },
  ],
  closeBrowser: [],
  forEachElement: [
    {
      key: "selector",
      label: "Selector",
      type: "string",
      hint: "CSS selector for the set of elements to iterate over",
      example: ".product-row",
    },
    {
      key: "textContentSelector",
      label: "Text content selector",
      type: "string",
      hint: "Within each matched element, read text from this sub-selector",
      example: ".product-name",
    },
    {
      key: "excludeTextPatterns",
      label: "Exclude text patterns",
      type: "stringArray",
      hint: "Skip elements whose text matches any of these substrings",
      example: "Loading...",
    },
    {
      key: "clickSelector",
      label: "Click selector",
      type: "string",
      hint: "Within each matched element, click this sub-selector",
      example: "button.details",
    },
    {
      key: "skipIfPositionMatch",
      label: "Skip position match",
      type: "object",
      hint: "Skip an element if its bounding-box position matches this object",
    },
  ],
};
