import type {
  ActionStep,
  AppConfig,
  ContextValidationWarning,
  StepPath,
} from "../../../../shared/types";
import type { ActionEditorDraft } from "../types";
import type { ActionEditorValidationIssue } from "./actionEditorValidation";
import { hasActionNameConflict } from "./actionNameConflict";
import { validateBrowserProfileKey } from "./browserProfileValidation";
import { formatActionTypeLabel } from "./formatActionTypeLabel";
import { getStepAtPath, stepPathToKey } from "./stepPath";

export type FlowValidationSeverity = "error" | "warning";

export interface FlowValidationBannerItem {
  id: string;
  severity: FlowValidationSeverity;
  message: string;
  stepPath?: StepPath;
}

const LANE_LABELS: Record<string, string> = {
  steps: "Main flow",
  try: "Try lane",
  catch: "Catch lane",
  finally: "Finally lane",
  then: "Then lane",
  else: "Else lane",
};

function formatLaneLabel(arrayKey: string): string {
  return LANE_LABELS[arrayKey] ?? arrayKey;
}

export function formatStepLabel(rootSteps: ActionStep[], stepPath: StepPath): string {
  const step = getStepAtPath(rootSteps, stepPath);
  const lastSegment = stepPath[stepPath.length - 1];
  const laneLabel = formatLaneLabel(lastSegment.arrayKey);
  const stepNumber = lastSegment.stepIndex + 1;
  const actionLabel = step ? formatActionTypeLabel(step.action) : "Step";

  if (stepPath.length === 1 && lastSegment.arrayKey === "steps") {
    return `Step ${stepNumber} · ${actionLabel}`;
  }

  return `${laneLabel} · step ${stepNumber} · ${actionLabel}`;
}

export function buildStepValidationSeverityMap(
  showValidationFeedback: boolean,
  contextWarnings: ContextValidationWarning[],
  editorValidationIssues: ActionEditorValidationIssue[],
): Map<string, FlowValidationSeverity> {
  if (!showValidationFeedback) {
    return new Map();
  }

  const severityByStepKey = new Map<string, FlowValidationSeverity>();

  contextWarnings.forEach((warning) => {
    const stepKey = stepPathToKey(warning.stepPath);
    if (!severityByStepKey.has(stepKey)) {
      severityByStepKey.set(stepKey, "warning");
    }
  });

  editorValidationIssues.forEach((issue) => {
    severityByStepKey.set(stepPathToKey(issue.stepPath), "error");
  });

  return severityByStepKey;
}

function collectDraftValidationIssues(
  draft: ActionEditorDraft,
  config: AppConfig,
  editorMode: "create" | "edit",
  editorOriginalActionName: string | null,
): FlowValidationBannerItem[] {
  const issues: FlowValidationBannerItem[] = [];
  const nextActionName = draft.actionName.trim();

  if (nextActionName.length === 0) {
    issues.push({
      id: "draft-empty-action-name",
      severity: "error",
      message: "Action name cannot be empty.",
    });
  }

  const browserProfileValue = draft.actionConfig.browserProfile;
  if (typeof browserProfileValue === "string") {
    const browserProfileValidationError = validateBrowserProfileKey(browserProfileValue);
    if (browserProfileValidationError) {
      issues.push({
        id: "draft-invalid-browser-profile",
        severity: "error",
        message: `Invalid browser profile: ${browserProfileValidationError}`,
      });
    }
  }

  if (
    nextActionName.length > 0 &&
    hasActionNameConflict({
      actionRunner: config.actionRunner,
      editorMode,
      editorOriginalActionName,
      nextActionName,
    })
  ) {
    issues.push({
      id: "draft-duplicate-action-name",
      severity: "error",
      message: `Action "${nextActionName}" already exists.`,
    });
  }

  return issues;
}

export type DraftFieldValidationKey = "actionName" | "browserProfile";

export function getFieldBlockClassName(
  baseClassName: string,
  severity: FlowValidationSeverity | undefined,
): string {
  return severity ? `${baseClassName} field-block--${severity}` : baseClassName;
}

function pathsEqual(firstPath: StepPath, secondPath: StepPath): boolean {
  return stepPathToKey(firstPath) === stepPathToKey(secondPath);
}

function applyFieldSeverity(
  severityByFieldKey: Map<string, FlowValidationSeverity>,
  fieldKey: string,
  severity: FlowValidationSeverity,
): void {
  const existingSeverity = severityByFieldKey.get(fieldKey);
  if (existingSeverity !== "error") {
    severityByFieldKey.set(fieldKey, severity);
  }
}

export function buildFieldValidationSeverityMap(input: {
  showValidationFeedback: boolean;
  selectedStepPath: StepPath | null;
  contextWarnings: ContextValidationWarning[];
  editorValidationIssues: ActionEditorValidationIssue[];
}): Map<string, FlowValidationSeverity> {
  if (!input.showValidationFeedback || !input.selectedStepPath) {
    return new Map();
  }

  const severityByFieldKey = new Map<string, FlowValidationSeverity>();

  input.contextWarnings.forEach((warning) => {
    if (!pathsEqual(warning.stepPath, input.selectedStepPath!)) {
      return;
    }
    applyFieldSeverity(severityByFieldKey, warning.fieldPath, "warning");
  });

  input.editorValidationIssues.forEach((issue) => {
    if (!pathsEqual(issue.stepPath, input.selectedStepPath!)) {
      return;
    }
    applyFieldSeverity(severityByFieldKey, issue.fieldKey, "error");
  });

  return severityByFieldKey;
}

export function buildDraftFieldValidationState(input: {
  showValidationFeedback: boolean;
  draft: ActionEditorDraft;
  config: AppConfig;
  editorMode: "create" | "edit";
  editorOriginalActionName: string | null;
}): Partial<Record<DraftFieldValidationKey, FlowValidationSeverity>> {
  if (!input.showValidationFeedback) {
    return {};
  }

  const draftIssues = collectDraftValidationIssues(
    input.draft,
    input.config,
    input.editorMode,
    input.editorOriginalActionName,
  );

  const state: Partial<Record<DraftFieldValidationKey, FlowValidationSeverity>> = {};

  draftIssues.forEach((issue) => {
    if (issue.id === "draft-empty-action-name" || issue.id === "draft-duplicate-action-name") {
      state.actionName = "error";
    }
    if (issue.id === "draft-invalid-browser-profile") {
      state.browserProfile = "error";
    }
  });

  return state;
}

export function collectFlowValidationBannerItems(input: {
  showValidationFeedback: boolean;
  rootSteps: ActionStep[];
  contextWarnings: ContextValidationWarning[];
  editorValidationIssues: ActionEditorValidationIssue[];
  draft: ActionEditorDraft;
  config: AppConfig;
  editorMode: "create" | "edit";
  editorOriginalActionName: string | null;
  saveErrorMessage: string | null;
}): FlowValidationBannerItem[] {
  if (!input.showValidationFeedback) {
    if (!input.saveErrorMessage) {
      return [];
    }

    return [
      {
        id: "save-error-message",
        severity: "error",
        message: input.saveErrorMessage,
      },
    ];
  }

  const items: FlowValidationBannerItem[] = [
    ...collectDraftValidationIssues(
      input.draft,
      input.config,
      input.editorMode,
      input.editorOriginalActionName,
    ),
  ];

  input.editorValidationIssues.forEach((issue, issueIndex) => {
    items.push({
      id: `editor-issue-${issueIndex}-${stepPathToKey(issue.stepPath)}`,
      severity: "error",
      message: `${formatStepLabel(input.rootSteps, issue.stepPath)} — ${issue.message}`,
      stepPath: issue.stepPath,
    });
  });

  input.contextWarnings.forEach((warning, warningIndex) => {
    items.push({
      id: `context-warning-${warningIndex}-${stepPathToKey(warning.stepPath)}-${warning.variableName}`,
      severity: "warning",
      message: `${formatStepLabel(input.rootSteps, warning.stepPath)} — field "${warning.fieldPath}" references missing variable "${warning.variableName}".`,
      stepPath: warning.stepPath,
    });
  });

  if (input.saveErrorMessage) {
    items.push({
      id: "save-error-message",
      severity: "error",
      message: input.saveErrorMessage,
    });
  }

  return items;
}

export function hasBlockingEditorSaveIssues(input: {
  draft: ActionEditorDraft;
  config: AppConfig;
  editorMode: "create" | "edit";
  editorOriginalActionName: string | null;
  editorValidationIssues: ActionEditorValidationIssue[];
}): boolean {
  const draftIssues = collectDraftValidationIssues(
    input.draft,
    input.config,
    input.editorMode,
    input.editorOriginalActionName,
  );

  return draftIssues.length > 0 || input.editorValidationIssues.length > 0;
}

export function lookupValidationSeverity(
  severityByStepKey: Map<string, FlowValidationSeverity>,
  stepPath: StepPath,
): FlowValidationSeverity | undefined {
  return severityByStepKey.get(stepPathToKey(stepPath));
}
