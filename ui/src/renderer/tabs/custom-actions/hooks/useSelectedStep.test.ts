/**
 * @vitest-environment happy-dom
 */
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ActionStep } from "../../../../shared/types";
import { useSelectedStep } from "./useSelectedStep";

describe("useSelectedStep", () => {
  it("resolves the selected step from the current step path", () => {
    const steps: ActionStep[] = [{ action: "wait", ms: 100 }];
    const { result } = renderHook(() =>
      useSelectedStep({
        currentEditorActionSteps: steps,
        selectedStepPath: [{ arrayKey: "steps", stepIndex: 0 }],
      }),
    );

    expect(result.current.selectedStep?.action).toBe("wait");
    expect(result.current.selectedStepPathKey).toBe("steps.0");
  });

  it("returns null selection state when no step path is selected", () => {
    const steps: ActionStep[] = [{ action: "wait", ms: 100 }];
    const { result } = renderHook(() =>
      useSelectedStep({
        currentEditorActionSteps: steps,
        selectedStepPath: null,
      }),
    );

    expect(result.current.selectedStep).toBeNull();
    expect(result.current.selectedStepPathKey).toBe("none");
  });
});
