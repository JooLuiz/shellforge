import { describe, expect, it } from "vitest";
import type { ActionStep } from "../../../../shared/types";
import { actionUsesBrowserSteps } from "./browserStepUtils";

describe("actionUsesBrowserSteps", () => {
  it("returns true when a top-level browser step exists", () => {
    const steps: ActionStep[] = [{ action: "navigate", url: "https://example.com" }];

    expect(actionUsesBrowserSteps(steps)).toBe(true);
  });

  it("returns false for shell-only actions", () => {
    const steps: ActionStep[] = [{ action: "shell", command: "git status" }];

    expect(actionUsesBrowserSteps(steps)).toBe(false);
  });

  it("returns false for apiRequest-only actions", () => {
    const steps: ActionStep[] = [{ action: "apiRequest", method: "GET", url: "https://example.com" }];

    expect(actionUsesBrowserSteps(steps)).toBe(false);
  });

  it("returns true when a browser step exists inside tryCatch catch lane", () => {
    const steps: ActionStep[] = [
      {
        action: "tryCatch",
        try: [{ action: "shell", command: "echo hi" }],
        catch: [{ action: "click", selector: "#retry" }],
      },
    ];

    expect(actionUsesBrowserSteps(steps)).toBe(true);
  });

  it("returns false when forEach sub-steps contain only non-browser steps", () => {
    const steps: ActionStep[] = [
      {
        action: "forEach",
        list: [1, 2],
        steps: [{ action: "wait", ms: 1000 }],
      },
    ];

    expect(actionUsesBrowserSteps(steps)).toBe(false);
  });

  it("returns true for forEachElement even when it has no sub-steps", () => {
    const steps: ActionStep[] = [{ action: "forEachElement", selector: ".row", steps: [] }];

    expect(actionUsesBrowserSteps(steps)).toBe(true);
  });

  it("returns false for an empty step list", () => {
    expect(actionUsesBrowserSteps([])).toBe(false);
  });
});
