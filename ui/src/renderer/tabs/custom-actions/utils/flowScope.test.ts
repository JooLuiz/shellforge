import { describe, expect, it } from "vitest";
import type { ActionStep } from "../../../../shared/types";
import {
  buildBreadcrumbSegments,
  getParentContainerPath,
  isStepPathPrefix,
  normalizeContainerPath,
  normalizeContainerPathAfterDelete,
  normalizeContainerPathAfterStepChange,
  resolveBlockScopeEntryPath,
  resolveFlowContainerStep,
} from "./flowScope";

const rootSteps: ActionStep[] = [
  { action: "shell", command: "echo root" },
  {
    action: "forEach",
    list: [],
    steps: [
      {
        action: "ifElse",
        left: "{{context.flag}}",
        operator: "exists",
        then: [{ action: "shell", command: "echo then" }],
        else: [],
      },
    ],
  },
];

describe("resolveFlowContainerStep", () => {
  it("returns null for root scope", () => {
    expect(resolveFlowContainerStep(rootSteps, [])).toBeNull();
  });

  it("returns block step at container path", () => {
    const containerPath = [
      { arrayKey: "steps", stepIndex: 1 },
      { arrayKey: "steps", stepIndex: 0 },
    ];
    const containerStep = resolveFlowContainerStep(rootSteps, containerPath);
    expect(containerStep?.action).toBe("ifElse");
  });
});

describe("buildBreadcrumbSegments", () => {
  it("builds root-only breadcrumb at action scope", () => {
    expect(buildBreadcrumbSegments(rootSteps, [], "MyAction")).toEqual([
      { label: "MyAction", containerPath: [] },
    ]);
  });

  it("builds nested breadcrumb segments for block scopes", () => {
    const forEachPath = [{ arrayKey: "steps", stepIndex: 1 }];
    const ifElsePath = [
      { arrayKey: "steps", stepIndex: 1 },
      { arrayKey: "steps", stepIndex: 0 },
    ];

    expect(buildBreadcrumbSegments(rootSteps, forEachPath, "MyAction")).toEqual([
      { label: "MyAction", containerPath: [] },
      { label: "Step 2: For Each", containerPath: forEachPath },
    ]);

    expect(buildBreadcrumbSegments(rootSteps, ifElsePath, "MyAction")).toEqual([
      { label: "MyAction", containerPath: [] },
      { label: "Step 2: For Each", containerPath: forEachPath },
      { label: "Step 1: If Else", containerPath: ifElsePath },
    ]);
  });
});

describe("normalizeContainerPath", () => {
  it("falls back to root when container step no longer exists", () => {
    const invalidPath = [{ arrayKey: "steps", stepIndex: 99 }];
    expect(normalizeContainerPath(rootSteps, invalidPath)).toEqual([]);
  });
});

describe("resolveBlockScopeEntryPath", () => {
  it("returns deepest block ancestor for inner lane step paths", () => {
    const innerIfElsePath = [
      { arrayKey: "steps", stepIndex: 1 },
      { arrayKey: "steps", stepIndex: 0 },
      { arrayKey: "then", stepIndex: 0 },
    ];

    expect(resolveBlockScopeEntryPath(rootSteps, innerIfElsePath)).toEqual([
      { arrayKey: "steps", stepIndex: 1 },
      { arrayKey: "steps", stepIndex: 0 },
    ]);
  });

  it("returns block path when double-clicking a root block group", () => {
    expect(
      resolveBlockScopeEntryPath(rootSteps, [{ arrayKey: "steps", stepIndex: 1 }]),
    ).toEqual([{ arrayKey: "steps", stepIndex: 1 }]);
  });

  it("returns null for leaf step paths without block ancestors", () => {
    expect(
      resolveBlockScopeEntryPath(rootSteps, [{ arrayKey: "steps", stepIndex: 0 }]),
    ).toBeNull();
  });
});

describe("scope pop helpers", () => {
  it("detects step path prefixes", () => {
    const forEachPath = [{ arrayKey: "steps", stepIndex: 1 }];
    const ifElsePath = [
      { arrayKey: "steps", stepIndex: 1 },
      { arrayKey: "steps", stepIndex: 0 },
    ];

    expect(isStepPathPrefix(forEachPath, ifElsePath)).toBe(true);
    expect(isStepPathPrefix(ifElsePath, forEachPath)).toBe(false);
  });

  it("pops scope when deleted step is current container", () => {
    const forEachPath = [{ arrayKey: "steps", stepIndex: 1 }];
    expect(normalizeContainerPathAfterDelete(rootSteps, forEachPath, forEachPath)).toEqual([]);
  });

  it("pops scope when block step type changes away from block inside current scope", () => {
    const ifElsePath = [
      { arrayKey: "steps", stepIndex: 1 },
      { arrayKey: "steps", stepIndex: 0 },
    ];
    expect(
      normalizeContainerPathAfterStepChange(rootSteps, ifElsePath, ifElsePath, "shell"),
    ).toEqual([{ arrayKey: "steps", stepIndex: 1 }]);
  });

  it("returns parent container path", () => {
    expect(
      getParentContainerPath([
        { arrayKey: "steps", stepIndex: 1 },
        { arrayKey: "steps", stepIndex: 0 },
      ]),
    ).toEqual([{ arrayKey: "steps", stepIndex: 1 }]);
  });
});
