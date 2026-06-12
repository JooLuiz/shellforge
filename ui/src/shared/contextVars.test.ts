import { describe, expect, it } from "vitest";
import {
  inferContextVariables,
  inferContextVariablesBeforeStep,
  validateContextReferences,
} from "./contextVars";
import type { ActionStep, StepPath } from "./types";

describe("contextVars", () => {
  it("infers variables from storeAs and getArguments", () => {
    const steps: ActionStep[] = [
      { action: "getArguments", required: ["taskId"], defaults: { envName: "dev" } },
      { action: "apiRequest", url: "https://api", storeAs: "response" },
      { action: "setVariable", source: "{{context.response.id}}", storeAs: "taskIdExtracted" },
    ];

    expect(inferContextVariables(steps)).toEqual(
      expect.arrayContaining(["taskId", "envName", "response", "taskIdExtracted"]),
    );
  });

  it("returns warning for unknown context variable", () => {
    const steps: ActionStep[] = [
      { action: "navigate", url: "https://example.com/{{context.missingValue}}" },
      { action: "getArguments", required: ["knownValue"] },
      { action: "type", selector: "#input", value: "{{context.knownValue}}" },
    ];

    const warnings = validateContextReferences(steps);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].variableName).toBe("missingValue");
    expect(warnings[0].stepPath).toEqual([{ arrayKey: "steps", stepIndex: 0 }]);
  });

  it("does not warn when tryCatch try lane produces variable before use", () => {
    const steps: ActionStep[] = [
      {
        action: "getArguments",
        defaults: { jiraTicket: "unknown-ticket" },
      },
      {
        action: "tryCatch",
        try: [
          {
            action: "invokeAction",
            name: "child-action",
            storeAs: "ticketResult",
          },
          {
            action: "setVariable",
            source: "{{context.ticketResult.jiraTicket}}",
            storeAs: "jiraTicket",
          },
        ],
        catch: [],
      },
    ];

    expect(validateContextReferences(steps)).toEqual([]);
  });

  it("warns when nested try lane references a variable not produced earlier in the lane", () => {
    const steps: ActionStep[] = [
      {
        action: "tryCatch",
        try: [
          {
            action: "setVariable",
            source: "{{context.missingTicket}}",
            storeAs: "jiraTicket",
          },
        ],
        catch: [],
      },
    ];

    const warnings = validateContextReferences(steps);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].variableName).toBe("missingTicket");
    expect(warnings[0].stepPath).toEqual([
      { arrayKey: "steps", stepIndex: 0 },
      { arrayKey: "try", stepIndex: 0 },
    ]);
  });

  it("excludes variables produced by the selected step and later steps", () => {
    const steps: ActionStep[] = [
      { action: "setVariable", source: "first", storeAs: "firstVar" },
      { action: "setVariable", source: "second", storeAs: "secondVar" },
      { action: "setVariable", source: "{{context.firstVar}}", storeAs: "thirdVar" },
    ];

    const secondStepPath: StepPath = [{ arrayKey: "steps", stepIndex: 1 }];

    expect(inferContextVariablesBeforeStep(steps, secondStepPath)).toEqual(["firstVar"]);
  });

  it("includes item and index only inside forEach sub-steps", () => {
    const steps: ActionStep[] = [
      {
        action: "forEach",
        list: ["a"],
        steps: [{ action: "setVariable", source: "{{context.item}}", storeAs: "currentItem" }],
      },
      { action: "setVariable", source: "after", storeAs: "afterLoop" },
    ];

    const siblingAfterForEachPath: StepPath = [{ arrayKey: "steps", stepIndex: 1 }];
    const insideForEachPath: StepPath = [
      { arrayKey: "steps", stepIndex: 0 },
      { arrayKey: "steps", stepIndex: 0 },
    ];

    expect(inferContextVariablesBeforeStep(steps, siblingAfterForEachPath)).not.toContain("item");
    expect(inferContextVariablesBeforeStep(steps, insideForEachPath)).toEqual(
      expect.arrayContaining(["item", "index"]),
    );
  });

  it("includes errorMessage only in tryCatch catch and finally lanes", () => {
    const steps: ActionStep[] = [
      {
        action: "tryCatch",
        try: [{ action: "setVariable", source: "try-value", storeAs: "tryVar" }],
        catch: [{ action: "setVariable", source: "{{context.errorMessage}}", storeAs: "handled" }],
        finally: [{ action: "setVariable", source: "{{context.errorMessage}}", storeAs: "done" }],
      },
    ];

    const tryStepPath: StepPath = [
      { arrayKey: "steps", stepIndex: 0 },
      { arrayKey: "try", stepIndex: 0 },
    ];
    const catchStepPath: StepPath = [
      { arrayKey: "steps", stepIndex: 0 },
      { arrayKey: "catch", stepIndex: 0 },
    ];
    const finallyStepPath: StepPath = [
      { arrayKey: "steps", stepIndex: 0 },
      { arrayKey: "finally", stepIndex: 0 },
    ];

    expect(inferContextVariablesBeforeStep(steps, tryStepPath)).not.toContain("errorMessage");
    expect(inferContextVariablesBeforeStep(steps, catchStepPath)).toEqual(
      expect.arrayContaining(["tryVar", "errorMessage"]),
    );
    expect(inferContextVariablesBeforeStep(steps, finallyStepPath)).toEqual(
      expect.arrayContaining(["tryVar", "errorMessage"]),
    );
  });

  it("returns an empty list when no step is selected", () => {
    const steps: ActionStep[] = [
      { action: "setVariable", source: "value", storeAs: "saved" },
    ];

    expect(inferContextVariablesBeforeStep(steps, null)).toEqual([]);
  });
});
