import type { Dispatch, SetStateAction } from "react";
import type { AppConfig } from "../../../../shared/types";
import { DEFAULT_NEW_STEP_TYPE } from "../constants";
import type {
  ActionEditorDraft,
  EditSaveStatus,
  EditorMode,
  InsertionPoint,
  StepPath,
  StepUpdater,
} from "../types";
import { serializeEditorDraft } from "../utils/actionConfigUtils";
import { getDefaultFocusStepPath } from "../utils/flowViewportFocus";
import {
  normalizeContainerPathAfterDelete,
  normalizeContainerPathAfterStepChange,
} from "../utils/flowScope";
import {
  addStepAtPath,
  deleteStepAtPath,
  getStepAtPath,
  setStepAtPath,
} from "../utils/stepPath";
import { cloneActionConfig, createEmptyStep, getActionSteps } from "../utils/stepUtils";

interface UseEditorLifecycleInput {
  config: AppConfig;
  setEditorDraft: Dispatch<SetStateAction<ActionEditorDraft | null>>;
  setEditorErrorMessage: (message: string | null) => void;
  setEditorMode: (mode: EditorMode) => void;
  setEditorOriginalActionName: (actionName: string | null) => void;
  setEditorSaveStatus: (status: EditSaveStatus) => void;
  setFlowContainerPathState: Dispatch<SetStateAction<StepPath>>;
  setIsSavingEditor: (isSaving: boolean) => void;
  setJsonDraftByFieldId: Dispatch<SetStateAction<Record<string, string>>>;
  setJsonErrorByFieldId: Dispatch<SetStateAction<Record<string, string>>>;
  setLastSavedSnapshot: (snapshot: string) => void;
  setSelectedStepPath: (path: StepPath | null) => void;
  setShowValidationFeedback: (show: boolean) => void;
}

interface UseEditorLifecycleResult {
  closeEditorModal: () => void;
  openCreateEditor: () => void;
  openEditEditor: (actionName: string) => void;
}

export function useEditorLifecycle({
  config,
  setEditorDraft,
  setEditorErrorMessage,
  setEditorMode,
  setEditorOriginalActionName,
  setEditorSaveStatus,
  setFlowContainerPathState,
  setIsSavingEditor,
  setJsonDraftByFieldId,
  setJsonErrorByFieldId,
  setLastSavedSnapshot,
  setSelectedStepPath,
  setShowValidationFeedback,
}: UseEditorLifecycleInput): UseEditorLifecycleResult {
  const closeEditorModal = (): void => {
    setEditorMode(null);
    setEditorOriginalActionName(null);
    setEditorDraft(null);
    setSelectedStepPath(null);
    setFlowContainerPathState([]);
    setEditorErrorMessage(null);
    setEditorSaveStatus("saved");
    setIsSavingEditor(false);
    setLastSavedSnapshot("");
    setJsonDraftByFieldId({});
    setJsonErrorByFieldId({});
    setShowValidationFeedback(false);
  };

  const openCreateEditor = (): void => {
    const draft: ActionEditorDraft = {
      actionName: "",
      actionConfig: { steps: [] },
      customActionUi: { availableOnCLI: false, aliases: [] },
    };
    setEditorMode("create");
    setEditorOriginalActionName(null);
    setEditorDraft(draft);
    setSelectedStepPath(getDefaultFocusStepPath(getActionSteps(draft.actionConfig), []));
    setFlowContainerPathState([]);
    setEditorErrorMessage(null);
    setShowValidationFeedback(false);
    setEditorSaveStatus("dirty");
  };

  const openEditEditor = (actionName: string): void => {
    const currentActionConfig = config.actionRunner[actionName];
    const currentCustomActionUi = config.ui.customActions[actionName];
    if (!currentActionConfig || !currentCustomActionUi) {
      return;
    }
    const draft: ActionEditorDraft = {
      actionName,
      actionConfig: cloneActionConfig(currentActionConfig),
      customActionUi: {
        availableOnCLI: currentCustomActionUi.availableOnCLI,
        aliases: [...currentCustomActionUi.aliases],
      },
    };
    setEditorMode("edit");
    setEditorOriginalActionName(actionName);
    setEditorDraft(draft);
    setSelectedStepPath(getDefaultFocusStepPath(getActionSteps(draft.actionConfig), []));
    setFlowContainerPathState([]);
    setEditorErrorMessage(null);
    setShowValidationFeedback(false);
    setEditorSaveStatus("saved");
    setLastSavedSnapshot(serializeEditorDraft(draft));
  };

  return {
    closeEditorModal,
    openCreateEditor,
    openEditEditor,
  };
}

interface UseStepMutationsInput {
  editorDraft: ActionEditorDraft | null;
  editorMode: EditorMode;
  lastSavedSnapshot: string;
  selectedStepPath: StepPath | null;
  setEditorDraft: Dispatch<SetStateAction<ActionEditorDraft | null>>;
  setEditorSaveStatus: (status: EditSaveStatus) => void;
  setFlowContainerPathState: Dispatch<SetStateAction<StepPath>>;
  setSelectedStepPath: (path: StepPath | null) => void;
}

interface UseStepMutationsResult {
  addStepAtInsertionPoint: (insertionPoint: InsertionPoint) => void;
  changeSelectedStepAction: (nextActionType: string) => void;
  deleteSelectedStep: () => void;
  updateActionName: (nextActionName: string) => void;
  updateBrowserProfile: (nextProfile: string) => void;
  updateSelectedStep: (updater: StepUpdater) => void;
}

export function useStepMutations({
  editorDraft,
  editorMode,
  lastSavedSnapshot,
  selectedStepPath,
  setEditorDraft,
  setEditorSaveStatus,
  setFlowContainerPathState,
  setSelectedStepPath,
}: UseStepMutationsInput): UseStepMutationsResult {
  const updateEditorDraft = (
    updater: (previousDraft: ActionEditorDraft) => ActionEditorDraft,
  ): void => {
    setEditorDraft((previousDraft) => {
      if (!previousDraft) {
        return previousDraft;
      }
      const nextDraft = updater(previousDraft);
      if (editorMode === "edit") {
        setEditorSaveStatus(
          serializeEditorDraft(nextDraft) === lastSavedSnapshot ? "saved" : "dirty",
        );
      }
      return nextDraft;
    });
  };

  const updateSelectedStep = (updater: StepUpdater): void => {
    if (!selectedStepPath || selectedStepPath.length === 0) {
      return;
    }
    updateEditorDraft((previousDraft) => {
      const previousSteps = getActionSteps(previousDraft.actionConfig);
      const currentStep = getStepAtPath(previousSteps, selectedStepPath);
      if (!currentStep) {
        return previousDraft;
      }
      const nextSteps = setStepAtPath(previousSteps, selectedStepPath, updater(currentStep));
      return {
        ...previousDraft,
        actionConfig: { ...previousDraft.actionConfig, steps: nextSteps },
      };
    });
  };

  const addStepAtInsertionPoint = (insertionPoint: InsertionPoint): void => {
    const newStep = createEmptyStep(DEFAULT_NEW_STEP_TYPE);
    updateEditorDraft((previousDraft) => {
      const previousSteps = getActionSteps(previousDraft.actionConfig);
      const nextSteps = addStepAtPath(previousSteps, insertionPoint, newStep);
      return {
        ...previousDraft,
        actionConfig: { ...previousDraft.actionConfig, steps: nextSteps },
      };
    });

    const newStepPath: StepPath = [
      ...insertionPoint.parentPath,
      { arrayKey: insertionPoint.arrayKey, stepIndex: insertionPoint.insertionIndex },
    ];
    setSelectedStepPath(newStepPath);
  };

  const changeSelectedStepAction = (nextActionType: string): void => {
    if (!selectedStepPath || selectedStepPath.length === 0 || !editorDraft) {
      return;
    }
    const previousSteps = getActionSteps(editorDraft.actionConfig);
    const nextSteps = setStepAtPath(
      previousSteps,
      selectedStepPath,
      createEmptyStep(nextActionType),
    );
    setFlowContainerPathState((currentContainerPath) =>
      normalizeContainerPathAfterStepChange(
        nextSteps,
        currentContainerPath,
        selectedStepPath,
        nextActionType,
      ),
    );
    updateEditorDraft((previousDraft) => ({
      ...previousDraft,
      actionConfig: { ...previousDraft.actionConfig, steps: nextSteps },
    }));
  };

  const deleteSelectedStep = (): void => {
    if (!selectedStepPath || selectedStepPath.length === 0 || !editorDraft) {
      return;
    }
    const previousSteps = getActionSteps(editorDraft.actionConfig);
    const nextSteps = deleteStepAtPath(previousSteps, selectedStepPath);
    setFlowContainerPathState((currentContainerPath) =>
      normalizeContainerPathAfterDelete(nextSteps, currentContainerPath, selectedStepPath),
    );
    updateEditorDraft((previousDraft) => ({
      ...previousDraft,
      actionConfig: { ...previousDraft.actionConfig, steps: nextSteps },
    }));
    setSelectedStepPath(null);
  };

  const updateActionName = (nextActionName: string): void => {
    updateEditorDraft((previousDraft) => {
      const currentPrimaryAlias = previousDraft.customActionUi.aliases[0];
      const aliases =
        currentPrimaryAlias === previousDraft.actionName
          ? [nextActionName, ...previousDraft.customActionUi.aliases.slice(1)]
          : previousDraft.customActionUi.aliases;
      return {
        ...previousDraft,
        actionName: nextActionName,
        customActionUi: { ...previousDraft.customActionUi, aliases },
      };
    });
  };

  const updateBrowserProfile = (nextProfile: string): void => {
    updateEditorDraft((previousDraft) => {
      const trimmedProfile = nextProfile.trim();
      const nextActionConfig = { ...previousDraft.actionConfig };
      if (trimmedProfile.length === 0) {
        delete nextActionConfig.browserProfile;
      } else {
        nextActionConfig.browserProfile = trimmedProfile;
      }
      return {
        ...previousDraft,
        actionConfig: nextActionConfig,
      };
    });
  };

  return {
    addStepAtInsertionPoint,
    changeSelectedStepAction,
    deleteSelectedStep,
    updateActionName,
    updateBrowserProfile,
    updateSelectedStep,
  };
}
