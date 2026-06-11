import { describe, expect, it } from "vitest";
import type { ActionEditorDraft, ActionStep, AppConfig, StepPath } from "../../../../shared/types";
import {
  buildDraftFieldValidationState,
  buildFieldValidationSeverityMap,
  buildStepValidationSeverityMap,
  collectFlowValidationBannerItems,
  formatStepLabel,
  getFieldBlockClassName,
  hasBlockingEditorSaveIssues,
  lookupValidationSeverity,
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

  it("formats main-flow step labels", () => {
    const steps: ActionStep[] = [{ action: "wait", ms: 100 }];

    expect(formatStepLabel(steps, [{ arrayKey: "steps", stepIndex: 0 }])).toBe(
      "Step 1 · Wait",
    );
  });

  it("builds warning-only step severity when no editor issues exist", () => {
    const severityByStepKey = buildStepValidationSeverityMap(
      true,
      [{ stepPath, fieldPath: "source", variableName: "missingVar" }],
      [],
    );

    expect(severityByStepKey.get("steps.0/try.1")).toBe("warning");
  });

  it("adds validation severity classes only when a severity exists", () => {
    expect(getFieldBlockClassName("field-block", undefined)).toBe("field-block");
    expect(getFieldBlockClassName("field-block", "warning")).toBe(
      "field-block field-block--warning",
    );
  });

  it("collects banner items and respects save errors when feedback is hidden", () => {
    const draft: ActionEditorDraft = {
      actionName: "demo",
      actionConfig: { steps: [] },
      customActionUi: { availableOnCLI: true, aliases: [] },
    };
    const config: AppConfig = {
      actionRunner: {},
      ui: { predefinedCommands: {}, customActions: {} },
    };

    expect(
      collectFlowValidationBannerItems({
        showValidationFeedback: false,
        rootSteps: [],
        contextWarnings: [],
        editorValidationIssues: [],
        draft,
        config,
        editorMode: "create",
        editorOriginalActionName: null,
        saveErrorMessage: "Save failed.",
      }),
    ).toEqual([
      {
        id: "save-error-message",
        severity: "error",
        message: "Save failed.",
      },
    ]);
  });

  it("collects draft, editor, and context validation banner items", () => {
    const rootSteps: ActionStep[] = [{ action: "setVariable", source: "", storeAs: "" }];
    const draft: ActionEditorDraft = {
      actionName: "",
      actionConfig: { steps: rootSteps, browserProfile: "bad/profile" },
      customActionUi: { availableOnCLI: true, aliases: [] },
    };
    const config: AppConfig = {
      actionRunner: {},
      ui: { predefinedCommands: {}, customActions: {} },
    };

    const items = collectFlowValidationBannerItems({
      showValidationFeedback: true,
      rootSteps,
      contextWarnings: [
        {
          stepPath: [{ arrayKey: "steps", stepIndex: 0 }],
          fieldPath: "source",
          variableName: "missingVar",
        },
      ],
      editorValidationIssues: [
        {
          stepPath: [{ arrayKey: "steps", stepIndex: 0 }],
          fieldKey: "source",
          message: "Required field missing.",
        },
      ],
      draft,
      config,
      editorMode: "create",
      editorOriginalActionName: null,
      saveErrorMessage: "Save failed.",
    });

    expect(items.some((item) => item.id === "draft-empty-action-name")).toBe(true);
    expect(items.some((item) => item.id === "draft-invalid-browser-profile")).toBe(true);
    expect(items.some((item) => item.id.startsWith("editor-issue-"))).toBe(true);
    expect(items.some((item) => item.id.startsWith("context-warning-"))).toBe(true);
    expect(items.some((item) => item.id === "save-error-message")).toBe(true);
  });

  it("detects blocking save issues from draft and editor validation", () => {
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
      hasBlockingEditorSaveIssues({
        draft,
        config,
        editorMode: "create",
        editorOriginalActionName: null,
        editorValidationIssues: [],
      }),
    ).toBe(true);

    expect(
      hasBlockingEditorSaveIssues({
        draft: { ...draft, actionName: "valid" },
        config,
        editorMode: "create",
        editorOriginalActionName: null,
        editorValidationIssues: [
          {
            stepPath: [{ arrayKey: "steps", stepIndex: 0 }],
            fieldKey: "source",
            message: "Required field missing.",
          },
        ],
      }),
    ).toBe(true);
  });

  it("looks up validation severity by step path key", () => {
    const severityByStepKey = new Map<string, "warning">([["steps.0", "warning"]]);

    expect(
      lookupValidationSeverity(severityByStepKey, [{ arrayKey: "steps", stepIndex: 0 }]),
    ).toBe("warning");
    expect(
      lookupValidationSeverity(severityByStepKey, [{ arrayKey: "steps", stepIndex: 1 }]),
    ).toBeUndefined();
  });
});
