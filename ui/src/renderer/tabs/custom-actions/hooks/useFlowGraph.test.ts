/**
 * @vitest-environment happy-dom
 */
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ActionStep } from "../../../../shared/types";
import { useFlowGraph } from "./useFlowGraph";

describe("useFlowGraph", () => {
  it("builds nodes and edges for the current editor scope", () => {
    const steps: ActionStep[] = [{ action: "wait", ms: 100 }];
    const { result } = renderHook(() =>
      useFlowGraph({
        currentEditorActionSteps: steps,
        normalizedFlowContainerPath: [],
        stepValidationSeverityByKey: new Map(),
      }),
    );

    expect(result.current.nodes.length).toBeGreaterThan(0);
    expect(result.current.edges.length).toBeGreaterThan(0);
  });
});
