import { describe, expect, it } from "vitest";
import { inferContextVariables, validateContextReferences } from "./contextVars";
import type { ActionStep } from "./types";

describe("contextVars", () => {
  it("infers variables from storeAs and getArguments", () => {
    const steps: ActionStep[] = [
      { action: "getArguments", required: ["taskId"], defaults: { envName: "dev" } },
      { action: "apiRequest", url: "https://api", storeAs: "response" },
      { action: "extractVariable", source: "{{context.response.id}}", storeAs: "taskIdExtracted" },
    ];

    expect(inferContextVariables(steps)).toEqual(
      expect.arrayContaining(["taskId", "envName", "response", "taskIdExtracted"])
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
  });
});
