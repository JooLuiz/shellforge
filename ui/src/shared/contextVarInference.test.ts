import { describe, expect, it } from "vitest";
import { inferContextVariablesBeforeStep } from "./contextVarInference";
import type { ActionStep, StepPath } from "./types";

describe("contextVarInference", () => {
  it("includes item and index inside forEachElement sub-steps", () => {
    const steps: ActionStep[] = [
      {
        action: "forEachElement",
        selector: ".item",
        steps: [{ action: "setVariable", source: "{{context.index}}", storeAs: "position" }],
      },
    ];

    const insideForEachElementPath: StepPath = [
      { arrayKey: "steps", stepIndex: 0 },
      { arrayKey: "steps", stepIndex: 0 },
    ];

    expect(inferContextVariablesBeforeStep(steps, insideForEachElementPath)).toEqual(
      expect.arrayContaining(["item", "index"]),
    );
  });

  it("isolates variables between ifElse then and else lanes", () => {
    const steps: ActionStep[] = [
      {
        action: "ifElse",
        condition: { left: "1", operator: "equals", right: "1" },
        then: [{ action: "setVariable", source: "yes", storeAs: "thenVar" }],
        else: [{ action: "setVariable", source: "{{context.thenVar}}", storeAs: "elseVar" }],
      },
    ];

    const elseStepPath: StepPath = [
      { arrayKey: "steps", stepIndex: 0 },
      { arrayKey: "else", stepIndex: 0 },
    ];

    expect(inferContextVariablesBeforeStep(steps, elseStepPath)).not.toContain("thenVar");
  });

  it("does not include sibling lane variables before the first then step", () => {
    const steps: ActionStep[] = [
      {
        action: "ifElse",
        condition: { left: "1", operator: "equals", right: "0" },
        then: [{ action: "setVariable", source: "yes", storeAs: "thenVar" }],
        else: [{ action: "setVariable", source: "{{context.thenVar}}", storeAs: "elseVar" }],
      },
    ];

    const thenStepPath: StepPath = [
      { arrayKey: "steps", stepIndex: 0 },
      { arrayKey: "then", stepIndex: 0 },
    ];

    expect(inferContextVariablesBeforeStep(steps, thenStepPath)).toEqual([]);
  });

  it("returns no variables for unsupported nested block targets", () => {
    const steps: ActionStep[] = [
      {
        action: "ifElse",
        condition: { left: "1", operator: "equals", right: "1" },
        then: [{ action: "setVariable", source: "yes", storeAs: "thenVar" }],
        else: [],
      },
    ];

    const invalidNestedPath: StepPath = [
      { arrayKey: "steps", stepIndex: 0 },
      { arrayKey: "steps", stepIndex: 0 },
    ];

    expect(inferContextVariablesBeforeStep(steps, invalidNestedPath)).toEqual([]);
  });

  it("returns no variables for invalid tryCatch lane paths", () => {
    const steps: ActionStep[] = [
      {
        action: "tryCatch",
        try: [{ action: "setVariable", source: "try", storeAs: "tryVar" }],
        catch: [],
      },
    ];

    const invalidNestedPath: StepPath = [
      { arrayKey: "steps", stepIndex: 0 },
      { arrayKey: "steps", stepIndex: 0 },
    ];

    expect(inferContextVariablesBeforeStep(steps, invalidNestedPath)).toEqual([]);
  });

  it("includes try lane and errorMessage when inferring inside the finally lane", () => {
    const steps: ActionStep[] = [
      {
        action: "tryCatch",
        try: [{ action: "setVariable", source: "try", storeAs: "tryVar" }],
        catch: [{ action: "setVariable", source: "catch", storeAs: "catchVar" }],
        finally: [{ action: "setVariable", source: "{{context.tryVar}}", storeAs: "done" }],
      },
    ];

    const finallyStepPath: StepPath = [
      { arrayKey: "steps", stepIndex: 0 },
      { arrayKey: "finally", stepIndex: 0 },
    ];

    expect(inferContextVariablesBeforeStep(steps, finallyStepPath)).toEqual(
      expect.arrayContaining(["tryVar", "catchVar", "errorMessage"]),
    );
  });
});
