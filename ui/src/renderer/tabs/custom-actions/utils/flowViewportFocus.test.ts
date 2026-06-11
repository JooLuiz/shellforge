import { describe, expect, it, vi } from "vitest";
import type { Node, ReactFlowInstance } from "reactflow";
import type { ActionStep } from "../../../../shared/types";
import {
  findFlowNodeById,
  findFlowNodeForStepPath,
  focusDefaultFlowViewport,
  focusFlowOnNode,
  focusFlowOnStepPath,
  getDefaultFocusInsertNodeId,
  getDefaultFocusStepPath,
} from "./flowViewportFocus";

const rootSteps: ActionStep[] = [
  { action: "shell", command: "echo root" },
  {
    action: "forEach",
    list: [],
    steps: [{ action: "shell", command: "echo inner" }],
  },
  {
    action: "tryCatch",
    try: [{ action: "shell", command: "echo try" }],
    catch: [],
    finally: [],
  },
  {
    action: "ifElse",
    left: "{{context.flag}}",
    operator: "exists",
    then: [{ action: "shell", command: "echo then" }],
    else: [{ action: "shell", command: "echo else" }],
  },
];

describe("getDefaultFocusStepPath", () => {
  it("returns first root step path when action has steps", () => {
    expect(getDefaultFocusStepPath(rootSteps, [])).toEqual([
      { arrayKey: "steps", stepIndex: 0 },
    ]);
  });

  it("returns null for empty root scope", () => {
    expect(getDefaultFocusStepPath([], [])).toBeNull();
  });

  it("returns first inner step for nested forEach scope", () => {
    const forEachPath = [{ arrayKey: "steps", stepIndex: 1 }];
    expect(getDefaultFocusStepPath(rootSteps, forEachPath)).toEqual([
      { arrayKey: "steps", stepIndex: 1 },
      { arrayKey: "steps", stepIndex: 0 },
    ]);
  });

  it("returns first step in first non-empty tryCatch lane", () => {
    const tryCatchPath = [{ arrayKey: "steps", stepIndex: 2 }];
    expect(getDefaultFocusStepPath(rootSteps, tryCatchPath)).toEqual([
      { arrayKey: "steps", stepIndex: 2 },
      { arrayKey: "try", stepIndex: 0 },
    ]);
  });

  it("returns first step in then lane for nested ifElse scope", () => {
    const ifElsePath = [{ arrayKey: "steps", stepIndex: 3 }];
    expect(getDefaultFocusStepPath(rootSteps, ifElsePath)).toEqual([
      { arrayKey: "steps", stepIndex: 3 },
      { arrayKey: "then", stepIndex: 0 },
    ]);
  });

  it("returns null when nested forEach scope has no inner steps", () => {
    const emptyForEachSteps: ActionStep[] = [
      { action: "forEach", list: [], steps: [] },
    ];
    expect(
      getDefaultFocusStepPath(emptyForEachSteps, [{ arrayKey: "steps", stepIndex: 0 }]),
    ).toBeNull();
  });
});

describe("getDefaultFocusInsertNodeId", () => {
  it("returns root insert node id at action scope", () => {
    expect(getDefaultFocusInsertNodeId([])).toBe("root__insert-0");
  });

  it("returns scoped insert node id for nested scope", () => {
    const forEachPath = [{ arrayKey: "steps", stepIndex: 1 }];
    expect(getDefaultFocusInsertNodeId(forEachPath)).toBe("scope-steps.1__insert-0");
  });
});

describe("flow viewport node lookup and focus", () => {
  const stepPath = [{ arrayKey: "steps", stepIndex: 0 }];
  const nodes: Node[] = [
    {
      id: "root__insert-0",
      type: "insertNode",
      position: { x: 0, y: 0 },
      data: {},
    },
    {
      id: "root__step-0",
      type: "stepNode",
      position: { x: 10, y: 20 },
      width: 100,
      height: 40,
      data: { stepPath },
    },
    {
      id: "root__block-0",
      type: "blockGroupNode",
      position: { x: 0, y: 0 },
      data: { stepPath },
    },
  ];

  it("finds nodes by id and step path, preferring block group matches", () => {
    expect(findFlowNodeById(nodes, "root__insert-0")?.id).toBe("root__insert-0");
    expect(findFlowNodeForStepPath(nodes, stepPath)?.type).toBe("blockGroupNode");
  });

  it("focuses the viewport on a node or step path", () => {
    const setCenter = vi.fn();
    const reactFlowInstance = { setCenter } as unknown as ReactFlowInstance;
    const targetNode = nodes[1]!;

    focusFlowOnNode(reactFlowInstance, targetNode);
    expect(setCenter).toHaveBeenCalledWith(60, 40, expect.objectContaining({ zoom: 1.15 }));

    expect(focusFlowOnStepPath(reactFlowInstance, nodes, stepPath)).toBe(true);
    expect(focusFlowOnStepPath(reactFlowInstance, [], stepPath)).toBe(false);
  });

  it("falls back to the default insert node when no focus step exists", () => {
    const setCenter = vi.fn();
    const reactFlowInstance = { setCenter } as unknown as ReactFlowInstance;
    const emptySteps: ActionStep[] = [];

    focusDefaultFlowViewport(reactFlowInstance, nodes, emptySteps, [], 1);
    expect(setCenter).toHaveBeenCalled();
  });
});
