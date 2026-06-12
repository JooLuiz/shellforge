import type { StepFieldDefinition } from "../types";

export const browserInteractionStepFields: Record<string, StepFieldDefinition[]> = {
  navigate: [
    {
      key: "url",
      label: "URL",
      type: "string",
      supportsInterpolation: true,
      hint: "Full URL to navigate to",
      example: "https://example.com/login",
    },
    {
      key: "waitForLoading",
      label: "Wait for loading",
      type: "boolean",
      hint: "Wait for loading overlays to disappear before continuing",
    },
  ],
  type: [
    {
      key: "selector",
      label: "Selector",
      type: "string",
      hint: "CSS selector for the input element to type into",
      example: "#username",
    },
    {
      key: "value",
      label: "Value",
      type: "string",
      supportsInterpolation: true,
      hint: "Text to type — supports context interpolation",
      example: "{{context.username}}",
    },
    {
      key: "delay",
      label: "Delay",
      type: "number",
      hint: "Milliseconds between each keystroke",
      example: "50",
    },
    {
      key: "iframe",
      label: "IFrame selector",
      type: "string",
      hint: "CSS selector for the iframe that contains the target element",
      example: "iframe#content-frame",
    },
  ],
  click: [
    {
      key: "selector",
      label: "Selector",
      type: "string",
      hint: "CSS selector for the element to click",
      example: "button.submit",
    },
    {
      key: "waitForSelector",
      label: "Wait for selector",
      type: "string",
      hint: "Wait until this selector is visible before clicking",
      example: ".modal-confirm",
    },
    {
      key: "waitForNavigation",
      label: "Wait for navigation",
      type: "boolean",
      hint: "Wait for the page to navigate after the click",
    },
    {
      key: "waitForLoading",
      label: "Wait for loading",
      type: "boolean",
      hint: "Wait for loading overlays to disappear after the click",
    },
    {
      key: "timeout",
      label: "Timeout (ms)",
      type: "number",
      hint: "Max time to wait for the selector, in milliseconds",
      example: "5000",
    },
    {
      key: "iframe",
      label: "IFrame selector",
      type: "string",
      hint: "CSS selector for the iframe that contains the target element",
      example: "iframe#content-frame",
    },
    {
      key: "jsClick",
      label: "Use JS click",
      type: "boolean",
      hint: "Trigger the click via JavaScript instead of a simulated mouse event — useful for elements blocked by overlays",
    },
  ],
};
