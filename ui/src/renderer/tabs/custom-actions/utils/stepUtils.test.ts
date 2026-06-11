import { describe, expect, it } from "vitest";
import type { ActionStep } from "../../../../shared/types";
import { formatSetWebStorageSummary, summarizeStep } from "./stepUtils";

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
});
