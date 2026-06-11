import { describe, expect, it } from "vitest";
import type { ActionEditorDraft, ActionStep, AppConfig, StepPath } from "../../../../shared/types";
import {
  buildDraftFieldValidationState,
  buildFieldValidationSeverityMap,
  buildStepValidationSeverityMap,
  formatStepLabel,
} from "./flowValidationUtils";

describe("flowValidationUtils", () => {
  const stepPath: StepPath = [
    { arrayKey: "steps", stepIndex: 0 },
    { arrayKey: "try", stepIndex: 1 },
  ];

  it("returns empty step severity map when validation feedback is hidden", () => {
    const severityByStepKey = buildStepValidationSeverityMap(
      false,
      [{ stepPath, fieldPath: "source", variableName: "missingVar" }],
      [{ stepPath, fieldKey: "source", message: "Required field missing." }],
    );

    expect(severityByStepKey.size).toBe(0);
  });

  it("prioritizes error severity over warning for the same step", () => {
    const severityByStepKey = buildStepValidationSeverityMap(
      true,
      [{ stepPath, fieldPath: "source", variableName: "missingVar" }],
      [{ stepPath, fieldKey: "source", message: "Required field missing." }],
    );

    expect(severityByStepKey.get("steps.0/try.1")).toBe("error");
  });

  it("returns empty field severity map when validation feedback is hidden", () => {
    const severityByFieldKey = buildFieldValidationSeverityMap({
      showValidationFeedback: false,
      selectedStepPath: stepPath,
      contextWarnings: [{ stepPath, fieldPath: "source", variableName: "missingVar" }],
      editorValidationIssues: [{ stepPath, fieldKey: "source", message: "Required field missing." }],
    });

    expect(severityByFieldKey.size).toBe(0);
  });

  it("returns expected field keys for the selected step when feedback is shown", () => {
    const severityByFieldKey = buildFieldValidationSeverityMap({
      showValidationFeedback: true,
      selectedStepPath: stepPath,
      contextWarnings: [{ stepPath, fieldPath: "source", variableName: "missingVar" }],
      editorValidationIssues: [{ stepPath, fieldKey: "left", message: "Invalid compare value." }],
    });

    expect(severityByFieldKey.get("source")).toBe("warning");
    expect(severityByFieldKey.get("left")).toBe("error");
  });

  it("lets error override warning on the same field", () => {
    const severityByFieldKey = buildFieldValidationSeverityMap({
      showValidationFeedback: true,
      selectedStepPath: stepPath,
      contextWarnings: [{ stepPath, fieldPath: "source", variableName: "missingVar" }],
      editorValidationIssues: [{ stepPath, fieldKey: "source", message: "Required field missing." }],
    });

    expect(severityByFieldKey.get("source")).toBe("error");
  });

  it("builds draft field validation state only after feedback is shown", () => {
    const draft: ActionEditorDraft = {
      actionName: "",
      actionConfig: { steps: [] },
      customActionUi: { availableOnCLI: true, aliases: [] },
    };
    const config: AppConfig = {
      actionRunner: {},
      ui: { predefinedCommands: {}, customActions: {} },
    };

    expect(
      buildDraftFieldValidationState({
        showValidationFeedback: false,
        draft,
        config,
        editorMode: "create",
        editorOriginalActionName: null,
      }),
    ).toEqual({});

    expect(
      buildDraftFieldValidationState({
        showValidationFeedback: true,
        draft,
        config,
        editorMode: "create",
        editorOriginalActionName: null,
      }),
    ).toEqual({ actionName: "error" });
  });

  it("formats nested step labels with lane context", () => {
    const steps: ActionStep[] = [
      {
        action: "tryCatch",
        try: [{ action: "setVariable", source: "value", storeAs: "saved" }],
        catch: [],
      },
    ];

    expect(
      formatStepLabel(steps, [
        { arrayKey: "steps", stepIndex: 0 },
        { arrayKey: "try", stepIndex: 0 },
      ]),
    ).toBe("Try lane · step 1 · Set Variable");
  });
});
