import { describe, expect, it } from "vitest";
import { buildFlowEdgeProps, FLOW_EDGE_CLASS_NAME } from "./flowEdgeStyle";

describe("flowEdgeStyle", () => {
  it("returns a CSS class name for theme-driven flow edges", () => {
    expect(buildFlowEdgeProps()).toEqual({ className: FLOW_EDGE_CLASS_NAME });
  });
});
