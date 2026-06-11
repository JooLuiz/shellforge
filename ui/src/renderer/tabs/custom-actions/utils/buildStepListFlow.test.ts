import { describe, expect, it } from "vitest";
import type { ActionStep } from "../../../../shared/types";
import { buildStepListFlow } from "./buildStepListFlow";

describe("buildStepListFlow", () => {
  it("assigns flow-edge class names instead of inline stroke colors", () => {
    const steps: ActionStep[] = [{ action: "wait", ms: 100 }];
    const { edges } = buildStepListFlow({
      steps,
      parentPath: [],
      arrayKey: "steps",
      nodeIdPrefix: "root",
      stepValidationSeverityByKey: new Map(),
    });

    expect(edges.length).toBeGreaterThan(0);
    edges.forEach((edge) => {
      expect(edge.className).toBe("flow-edge");
      expect(edge.style).toBeUndefined();
    });
  });

  it("builds nodes for simple and block steps", () => {
    const steps: ActionStep[] = [
      { action: "wait", ms: 100 },
      {
        action: "forEach",
        list: [1],
        steps: [{ action: "click", selector: "#item" }],
      },
    ];
    const severityMap = new Map<string, "error">([["steps.0", "error"]]);
    const { nodes, edges } = buildStepListFlow({
      steps,
      parentPath: [],
      arrayKey: "steps",
      nodeIdPrefix: "root",
      stepValidationSeverityByKey: severityMap,
    });

    expect(nodes.some((node) => node.type === "stepNode")).toBe(true);
    expect(nodes.some((node) => node.type === "blockGroupNode")).toBe(true);
    expect(nodes.some((node) => node.type === "insertNode")).toBe(true);
    expect(edges.length).toBeGreaterThan(1);
  });
});
