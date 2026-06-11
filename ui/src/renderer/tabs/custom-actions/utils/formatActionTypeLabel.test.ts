import { describe, expect, it } from "vitest";
import { formatActionTypeLabel } from "./formatActionTypeLabel";

describe("formatActionTypeLabel", () => {
  it("splits camelCase action keys into title case words", () => {
    expect(formatActionTypeLabel("invokeAction")).toBe("Invoke Action");
    expect(formatActionTypeLabel("waitForPageState")).toBe("Wait For Page State");
    expect(formatActionTypeLabel("forEachElement")).toBe("For Each Element");
  });

  it("formats block step action keys", () => {
    expect(formatActionTypeLabel("tryCatch")).toBe("Try Catch");
    expect(formatActionTypeLabel("ifElse")).toBe("If Else");
  });

  it("capitalizes single-word action keys", () => {
    expect(formatActionTypeLabel("navigate")).toBe("Navigate");
    expect(formatActionTypeLabel("shell")).toBe("Shell");
  });
});
