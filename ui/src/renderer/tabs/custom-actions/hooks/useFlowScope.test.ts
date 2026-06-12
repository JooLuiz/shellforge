/**
 * @vitest-environment happy-dom
 */
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ActionStep } from "../../../../shared/types";
import { useFlowScope } from "./useFlowScope";

describe("useFlowScope", () => {
  it("normalizes the container path and exposes breadcrumb segments", () => {
    const steps: ActionStep[] = [
      {
        action: "forEach",
        list: [1],
        steps: [{ action: "wait", ms: 1 }],
      },
    ];
    const setFlowContainerPathState = vi.fn();
    const setSelectedStepPath = vi.fn();

    const { result } = renderHook(() =>
      useFlowScope({
        currentEditorActionSteps: steps,
        editorActionName: "demo",
        flowContainerPath: [],
        hasEditorDraft: true,
        setFlowContainerPathState,
        setSelectedStepPath,
      }),
    );

    expect(result.current.flowBreadcrumbSegments[0]?.label).toBe("demo");
    result.current.enterBlockScope([{ arrayKey: "steps", stepIndex: 0 }]);
    expect(setFlowContainerPathState).toHaveBeenCalled();
  });

  it("ignores non-block scopes and clears selection when changing container path", () => {
    const steps: ActionStep[] = [{ action: "wait", ms: 100 }];
    const setFlowContainerPathState = vi.fn();
    const setSelectedStepPath = vi.fn();

    const { result } = renderHook(() =>
      useFlowScope({
        currentEditorActionSteps: steps,
        editorActionName: "demo",
        flowContainerPath: [],
        hasEditorDraft: false,
        setFlowContainerPathState,
        setSelectedStepPath,
      }),
    );

    expect(result.current.flowBreadcrumbSegments).toEqual([]);
    result.current.enterBlockScope([{ arrayKey: "steps", stepIndex: 0 }]);
    expect(setFlowContainerPathState).not.toHaveBeenCalled();

    result.current.setFlowContainerPath([{ arrayKey: "steps", stepIndex: 0 }]);
    expect(setFlowContainerPathState).toHaveBeenCalled();
    expect(setSelectedStepPath).toHaveBeenCalledWith(null);
  });
});
