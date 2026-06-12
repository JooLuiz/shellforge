import { describe, expect, it } from "vitest";
import type { ActionStep } from "./types";
import {
  collectStepsWithPaths,
  filterActionSteps,
  forEachNestedStepArray,
  isActionStep,
} from "./stepTreeTraversal";

describe("stepTreeTraversal", () => {
  it("returns an empty list when the root step array is empty", () => {
    expect(collectStepsWithPaths([], [], "steps")).toEqual([]);
  });

  it("collects nested steps under try/catch and ifElse branches", () => {
    const rootSteps: ActionStep[] = [
      {
        action: "tryCatch",
        try: [{ action: "shell", command: "echo try" }],
        catch: [{ action: "setVariable", name: "errorMessage", value: "failed" }],
      },
      {
        action: "ifElse",
        left: "{{context.count}}",
        operator: "eq",
        right: "1",
        then: [{ action: "wait", ms: 100 }],
        else: [{ action: "wait", ms: 200 }],
      },
    ];

    const collected = collectStepsWithPaths(rootSteps, [], "steps");

    expect(collected.map(({ step }) => step.action)).toEqual([
      "tryCatch",
      "shell",
      "setVariable",
      "ifElse",
      "wait",
      "wait",
    ]);
    expect(collected[1]?.path).toEqual([
      { arrayKey: "steps", stepIndex: 0 },
      { arrayKey: "try", stepIndex: 0 },
    ]);
    expect(collected[4]?.path).toEqual([
      { arrayKey: "steps", stepIndex: 1 },
      { arrayKey: "then", stepIndex: 0 },
    ]);
  });

  it("ignores invalid nested entries that are not action steps", () => {
    const rootSteps: ActionStep[] = [
      {
        action: "forEach",
        list: [1],
        steps: [{ action: "wait", ms: 1 }, null, "invalid", { action: "shell", command: "ok" }],
      },
    ];

    const collected = collectStepsWithPaths(rootSteps, [], "steps");

    expect(collected.map(({ step }) => step.action)).toEqual(["forEach", "wait", "shell"]);
  });

  it("filters action steps and walks nested arrays via forEachNestedStepArray", () => {
    const step: ActionStep = {
      action: "tryCatch",
      try: [{ action: "wait", ms: 10 }],
      catch: ["bad-entry"],
    };

    const visitedKeys: string[] = [];
    forEachNestedStepArray(step, (nestedKey, nestedSteps) => {
      visitedKeys.push(nestedKey);
      expect(nestedSteps.every(isActionStep)).toBe(true);
    });

    expect(visitedKeys).toEqual(["try", "catch"]);
    expect(filterActionSteps(["bad", { action: "shell", command: "ok" }])).toEqual([
      { action: "shell", command: "ok" },
    ]);
  });
});
