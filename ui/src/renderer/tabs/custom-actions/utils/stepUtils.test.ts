import { describe, expect, it } from "vitest";
import type { ActionConfig, ActionStep } from "../../../../shared/types";
import {
  cloneActionConfig,
  createEmptyStep,
  formatSetWebStorageSummary,
  getActionSteps,
  isActionStep,
  isRecord,
  parseLooseValue,
  summarizeStep,
  updateStepValue,
} from "./stepUtils";

describe("formatSetWebStorageSummary", () => {
  it("returns empty string when no storage targets are configured", () => {
    const step: ActionStep = { action: "setWebStorage" };

    expect(formatSetWebStorageSummary(step)).toBe("");
  });

  it("returns a single storage target label", () => {
    const step: ActionStep = {
      action: "setWebStorage",
      localStorage: { token: "abc" },
    };

    expect(formatSetWebStorageSummary(step)).toBe("localStorage");
  });

  it("joins two storage targets with and", () => {
    const step: ActionStep = {
      action: "setWebStorage",
      localStorage: { token: "abc" },
      cookies: [{ name: "session", value: "xyz" }],
    };

    expect(formatSetWebStorageSummary(step)).toBe("localStorage and cookies");
  });

  it("joins three storage targets with commas and and", () => {
    const step: ActionStep = {
      action: "setWebStorage",
      localStorage: { token: "abc" },
      sessionStorage: { sessionId: "123" },
      cookies: [{ name: "session", value: "xyz" }],
    };

    expect(formatSetWebStorageSummary(step)).toBe("localStorage, sessionStorage and cookies");
  });
});

describe("summarizeStep", () => {
  it("returns empty summary for closeBrowser", () => {
    expect(summarizeStep({ action: "closeBrowser" })).toBe("");
  });

  it("returns empty summary for getArguments", () => {
    expect(summarizeStep({ action: "getArguments", required: ["username"] })).toBe("");
  });

  it("keeps navigate summary unchanged", () => {
    expect(summarizeStep({ action: "navigate", url: "https://example.com" })).toBe(
      "url: https://example.com",
    );
  });

  it("keeps apiRequest summary unchanged", () => {
    expect(
      summarizeStep({ action: "apiRequest", method: "POST", url: "https://example.com/api" }),
    ).toBe("POST https://example.com/api");
  });

  it("formats invokeAction summary with action prefix", () => {
    expect(summarizeStep({ action: "invokeAction", name: "loginAction" })).toBe(
      "action: loginAction",
    );
  });

  it("delegates setWebStorage summary formatting", () => {
    expect(
      summarizeStep({
        action: "setWebStorage",
        sessionStorage: { sessionId: "123" },
        cookies: [{ name: "session", value: "xyz" }],
      }),
    ).toBe("sessionStorage and cookies");
  });

  it("summarizes additional step types", () => {
    expect(summarizeStep({ action: "type", value: "hello" })).toBe("value: hello");
    expect(summarizeStep({ action: "click", selector: "#btn" })).toBe("selector: #btn");
    expect(summarizeStep({ action: "wait", ms: 250 })).toBe("250ms");
    expect(summarizeStep({ action: "waitForPageState", selector: "#ready" })).toBe(
      "selector: #ready",
    );
    expect(summarizeStep({ action: "waitForPageState", urlContains: "/home" })).toBe(
      "urlContains: /home",
    );
    expect(summarizeStep({ action: "waitForPageState", waitForLoading: true })).toBe(
      "loading overlay",
    );
    expect(summarizeStep({ action: "waitForPageState" })).toBe("page state");
    expect(summarizeStep({ action: "shell", command: "echo hi" })).toBe("echo hi");
    expect(summarizeStep({ action: "setVariable", source: "a", storeAs: "b" })).toBe("a -> b");
    expect(summarizeStep({ action: "forEachElement", selector: ".item" })).toBe(
      "selector: .item",
    );
    expect(summarizeStep({ action: "forEach", list: [1, 2] })).toBe("list: 2 item(s)");
    expect(summarizeStep({ action: "forEach", count: 3 })).toBe("count: 3");
    expect(summarizeStep({ action: "tryCatch", try: [] })).toBe("try/catch block");
    expect(summarizeStep({ action: "ifElse", left: "a", operator: "eq" })).toBe("eq: a");
    expect(summarizeStep({ action: "writeFile", path: "/tmp/out.txt" })).toBe(
      "path: /tmp/out.txt",
    );
    expect(summarizeStep({ action: "customAction" })).toBe("customAction");
  });
});

describe("step helpers", () => {
  it("detects action steps and records", () => {
    expect(isActionStep({ action: "wait" })).toBe(true);
    expect(isActionStep({ action: 1 })).toBe(false);
    expect(isActionStep(null)).toBe(false);
    expect(isRecord({ key: "value" })).toBe(true);
    expect(isRecord([])).toBe(false);
  });

  it("clones action config and filters invalid steps", () => {
    const actionConfig: ActionConfig = {
      steps: [{ action: "wait", ms: 1 }, { invalid: true } as unknown as ActionStep],
    };

    expect(cloneActionConfig(actionConfig)).toEqual(actionConfig);
    expect(getActionSteps({ steps: "invalid" } as unknown as ActionConfig)).toEqual([]);
    expect(getActionSteps(actionConfig)).toEqual([{ action: "wait", ms: 1 }]);
  });

  it("creates empty steps for supported action types", () => {
    expect(createEmptyStep("navigate")).toEqual({ action: "navigate", url: "" });
    expect(createEmptyStep("type")).toEqual({ action: "type", selector: "", value: "" });
    expect(createEmptyStep("click")).toEqual({ action: "click", selector: "" });
    expect(createEmptyStep("wait")).toEqual({ action: "wait", ms: 1000 });
    expect(createEmptyStep("waitForPageState")).toEqual({
      action: "waitForPageState",
      selector: "",
    });
    expect(createEmptyStep("forEachElement")).toEqual({
      action: "forEachElement",
      selector: "",
      steps: [],
    });
    expect(createEmptyStep("apiRequest")).toEqual({ action: "apiRequest", method: "GET", url: "" });
    expect(createEmptyStep("setVariable")).toEqual({ action: "setVariable", source: "", storeAs: "" });
    expect(createEmptyStep("shell")).toEqual({ action: "shell", command: "" });
    expect(createEmptyStep("getArguments")).toEqual({ action: "getArguments", required: [] });
    expect(createEmptyStep("invokeAction")).toEqual({ action: "invokeAction", name: "" });
    expect(createEmptyStep("tryCatch")).toEqual({ action: "tryCatch", try: [] });
    expect(createEmptyStep("forEach")).toEqual({ action: "forEach", list: [], steps: [] });
    expect(createEmptyStep("ifElse")).toEqual({
      action: "ifElse",
      left: "",
      operator: "eq",
      right: "",
      then: [],
      else: [],
    });
    expect(createEmptyStep("writeFile")).toEqual({ action: "writeFile", path: "", content: "" });
    expect(createEmptyStep("unknown")).toEqual({ action: "unknown" });
  });

  it("updates step values by field type", () => {
    const baseStep: ActionStep = { action: "setVariable", source: "", storeAs: "" };

    expect(updateStepValue(baseStep, "source", "string", "value")).toEqual({
      ...baseStep,
      source: "value",
    });
    expect(updateStepValue(baseStep, "count", "number", "12")).toEqual({
      ...baseStep,
      count: 12,
    });
    expect(updateStepValue(baseStep, "count", "number", "not-a-number")).toEqual({
      ...baseStep,
      count: 0,
    });
    expect(updateStepValue(baseStep, "enabled", "boolean", "true")).toEqual({
      ...baseStep,
      enabled: true,
    });
    expect(updateStepValue(baseStep, "required", "stringArray", "a, b ,c")).toEqual({
      ...baseStep,
      required: ["a", "b", "c"],
    });
    expect(updateStepValue(baseStep, "payload", "object", '{"token":"abc"}')).toEqual({
      ...baseStep,
      payload: { token: "abc" },
    });
    expect(updateStepValue(baseStep, "payload", "object", "[]")).toBe(baseStep);
    expect(updateStepValue(baseStep, "payload", "json", "not-json")).toBe(baseStep);
    expect(updateStepValue(baseStep, "payload", "json", '["a"]')).toEqual({
      ...baseStep,
      payload: ["a"],
    });
  });

  it("parses loose values with JSON fallback", () => {
    expect(parseLooseValue("")).toBe("");
    expect(parseLooseValue('{"enabled":true}')).toEqual({ enabled: true });
    expect(parseLooseValue("plain-text")).toBe("plain-text");
  });
});
