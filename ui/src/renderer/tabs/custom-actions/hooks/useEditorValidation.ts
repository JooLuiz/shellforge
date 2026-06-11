import { useMemo } from "react";
import { validateContextReferences } from "../../../../shared/contextVars";
import type { AppConfig } from "../../../../shared/types";
import type { ActionEditorDraft, EditorMode, StepPath } from "../types";
import { validateActionEditorDraft } from "../utils/actionEditorValidation";
import {
  buildDraftFieldValidationState,
  buildFieldValidationSeverityMap,
  buildStepValidationSeverityMap,
  collectFlowValidationBannerItems,
  type DraftFieldValidationKey,
  type FlowValidationBannerItem,
  type FlowValidationSeverity,
} from "../utils/flowValidationUtils";
import type { ActionStep } from "../../../../shared/types";

interface UseEditorValidationInput {
  config: AppConfig;
  currentEditorActionSteps: ActionStep[];
  editorDraft: ActionEditorDraft | null;
  editorErrorMessage: string | null;
  editorMode: EditorMode;
  editorOriginalActionName: string | null;
  selectedStepPath: StepPath | null;
  showValidationFeedback: boolean;
}

interface UseEditorValidationResult {
  contextWarnings: ReturnType<typeof validateContextReferences>;
  draftFieldValidationState: Partial<Record<DraftFieldValidationKey, FlowValidationSeverity>>;
  editorValidationIssues: ReturnType<typeof validateActionEditorDraft>;
  fieldValidationByKey: Map<string, FlowValidationSeverity>;
  flowValidationBannerItems: FlowValidationBannerItem[];
  stepValidationSeverityByKey: Map<string, FlowValidationSeverity>;
}

export function useEditorValidation({
  config,
  currentEditorActionSteps,
  editorDraft,
  editorErrorMessage,
  editorMode,
  editorOriginalActionName,
  selectedStepPath,
  showValidationFeedback,
}: UseEditorValidationInput): UseEditorValidationResult {
  const contextWarnings = useMemo(
    () => validateContextReferences(currentEditorActionSteps),
    [currentEditorActionSteps],
  );

  const editorValidationIssues = useMemo(() => {
    if (!editorDraft) {
      return [];
    }
    return validateActionEditorDraft(editorDraft, config);
  }, [config, editorDraft]);

  const stepValidationSeverityByKey = useMemo(
    () =>
      buildStepValidationSeverityMap(
        showValidationFeedback,
        contextWarnings,
        editorValidationIssues,
      ),
    [contextWarnings, editorValidationIssues, showValidationFeedback],
  );

  const fieldValidationByKey = useMemo(
    () =>
      buildFieldValidationSeverityMap({
        showValidationFeedback,
        selectedStepPath,
        contextWarnings,
        editorValidationIssues,
      }),
    [contextWarnings, editorValidationIssues, selectedStepPath, showValidationFeedback],
  );

  const draftFieldValidationState = useMemo(() => {
    if (!editorDraft || !editorMode) {
      return {};
    }

    return buildDraftFieldValidationState({
      showValidationFeedback,
      draft: editorDraft,
      config,
      editorMode,
      editorOriginalActionName,
    });
  }, [config, editorDraft, editorMode, editorOriginalActionName, showValidationFeedback]);

  const flowValidationBannerItems = useMemo(() => {
    if (!editorDraft || !editorMode) {
      return [];
    }

    return collectFlowValidationBannerItems({
      showValidationFeedback,
      rootSteps: currentEditorActionSteps,
      contextWarnings,
      editorValidationIssues,
      draft: editorDraft,
      config,
      editorMode,
      editorOriginalActionName,
      saveErrorMessage: editorErrorMessage,
    });
  }, [
    config,
    contextWarnings,
    currentEditorActionSteps,
    editorDraft,
    editorErrorMessage,
    editorMode,
    editorOriginalActionName,
    editorValidationIssues,
    showValidationFeedback,
  ]);

  return {
    contextWarnings,
    draftFieldValidationState,
    editorValidationIssues,
    fieldValidationByKey,
    flowValidationBannerItems,
    stepValidationSeverityByKey,
  };
}
