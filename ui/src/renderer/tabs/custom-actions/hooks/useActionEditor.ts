import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  inferContextVariablesBeforeStep,
  validateContextReferences,
} from "../../../../shared/contextVars";
import type { ActionStep, AppConfig } from "../../../../shared/types";
import { SUPPORTED_ACTION_TYPES } from "../constants";
import type {
  ActionEditorDraft,
  EditSaveStatus,
  EditorMode,
  FlowBreadcrumbSegment,
  InsertionPoint,
  StepPath,
  StepUpdater,
} from "../types";
import { serializeEditorDraft } from "../utils/actionConfigUtils";
import { actionUsesBrowserSteps } from "../utils/browserStepUtils";
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
import { useTheme } from "../../../hooks/useTheme";
import { buildFlowNodesAndEdges } from "../utils/flow";
import { getDefaultFocusStepPath } from "../utils/flowViewportFocus";
import {
  buildBreadcrumbSegments,
  isBlockStepAction,
  normalizeContainerPath,
  normalizeContainerPathAfterDelete,
  normalizeContainerPathAfterStepChange,
} from "../utils/flowScope";
import {
  addStepAtPath,
  deleteStepAtPath,
  getStepAtPath,
  setStepAtPath,
  stepPathToKey,
} from "../utils/stepPath";
import { cloneActionConfig, createEmptyStep, getActionSteps } from "../utils/stepUtils";
import { useEditorPersistence } from "./useEditorPersistence";

interface UseActionEditorInput {
  config: AppConfig;
  onSave: (nextConfig: AppConfig) => Promise<void>;
}

interface UseActionEditorResult {
  contextVariables: string[];
  draftFieldValidationState: Partial<Record<DraftFieldValidationKey, FlowValidationSeverity>>;
  fieldValidationByKey: Map<string, FlowValidationSeverity>;
  flowValidationBannerItems: FlowValidationBannerItem[];
  editorDraft: ActionEditorDraft | null;
  editorErrorMessage: string | null;
  editorMode: EditorMode;
  editorSaveButtonLabel: string;
  editorSaveStatus: EditSaveStatus;
  edges: ReturnType<typeof buildFlowNodesAndEdges>["edges"];
  hasBrowserSteps: boolean;
  isSavingEditor: boolean;
  jsonDraftByFieldId: Record<string, string>;
  jsonErrorByFieldId: Record<string, string>;
  nodes: ReturnType<typeof buildFlowNodesAndEdges>["nodes"];
  flowBreadcrumbSegments: FlowBreadcrumbSegment[];
  flowContainerPath: StepPath;
  selectedStep: ActionStep | null;
  selectedStepPath: StepPath | null;
  selectedStepPathKey: string;
  addStepAtInsertionPoint: (insertionPoint: InsertionPoint) => void;
  changeSelectedStepAction: (nextActionType: string) => void;
  closeEditorModal: () => void;
  deleteSelectedStep: () => void;
  enterBlockScope: (blockStepPath: StepPath) => void;
  openCreateEditor: () => void;
  openEditEditor: (actionName: string) => void;
  persistEditorDraft: () => Promise<void>;
  setJsonDraftByFieldId: Dispatch<SetStateAction<Record<string, string>>>;
  setJsonErrorByFieldId: Dispatch<SetStateAction<Record<string, string>>>;
  setFlowContainerPath: (nextPath: StepPath) => void;
  setSelectedStepPath: (nextPath: StepPath | null) => void;
  updateActionName: (nextActionName: string) => void;
  updateBrowserProfile: (nextProfile: string) => void;
  updateSelectedStep: (updater: StepUpdater) => void;
}

export function useActionEditor({
  config,
  onSave,
}: UseActionEditorInput): UseActionEditorResult {
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [editorOriginalActionName, setEditorOriginalActionName] = useState<string | null>(null);
  const [editorDraft, setEditorDraft] = useState<ActionEditorDraft | null>(null);
  const [selectedStepPath, setSelectedStepPath] = useState<StepPath | null>(null);
  const [flowContainerPath, setFlowContainerPathState] = useState<StepPath>([]);
  const [newStepType] = useState(SUPPORTED_ACTION_TYPES[0]);
  const [editorSaveStatus, setEditorSaveStatus] = useState<EditSaveStatus>("saved");
  const [isSavingEditor, setIsSavingEditor] = useState(false);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState("");
  const [editorErrorMessage, setEditorErrorMessage] = useState<string | null>(null);
  const [jsonDraftByFieldId, setJsonDraftByFieldId] = useState<Record<string, string>>({});
  const [jsonErrorByFieldId, setJsonErrorByFieldId] = useState<Record<string, string>>({});
  const [showValidationFeedback, setShowValidationFeedback] = useState(false);
  const { theme } = useTheme();

  const currentEditorActionSteps = useMemo(
    () => (editorDraft ? getActionSteps(editorDraft.actionConfig) : []),
    [editorDraft],
  );

  const selectedStep = useMemo(() => {
    if (!selectedStepPath || selectedStepPath.length === 0) {
      return null;
    }
    return getStepAtPath(currentEditorActionSteps, selectedStepPath);
  }, [currentEditorActionSteps, selectedStepPath]);

  const selectedStepPathKey = selectedStepPath ? stepPathToKey(selectedStepPath) : "none";

  const normalizedFlowContainerPath = useMemo(
    () => normalizeContainerPath(currentEditorActionSteps, flowContainerPath),
    [currentEditorActionSteps, flowContainerPath],
  );

  const flowBreadcrumbSegments = useMemo(() => {
    if (!editorDraft) {
      return [];
    }
    return buildBreadcrumbSegments(
      currentEditorActionSteps,
      normalizedFlowContainerPath,
      editorDraft.actionName,
    );
  }, [currentEditorActionSteps, editorDraft, normalizedFlowContainerPath]);

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
  }, [
    config,
    editorDraft,
    editorMode,
    editorOriginalActionName,
    showValidationFeedback,
  ]);

  const { nodes, edges } = useMemo(
    () =>
      buildFlowNodesAndEdges(
        currentEditorActionSteps,
        normalizedFlowContainerPath,
        stepValidationSeverityByKey,
      ),
    [currentEditorActionSteps, normalizedFlowContainerPath, stepValidationSeverityByKey, theme],
  );

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

  const hasBrowserSteps = useMemo(
    () => actionUsesBrowserSteps(currentEditorActionSteps),
    [currentEditorActionSteps],
  );

  const contextVariables = useMemo(
    () => inferContextVariablesBeforeStep(currentEditorActionSteps, selectedStepPath),
    [currentEditorActionSteps, selectedStepPath],
  );

  const setFlowContainerPath = (nextPath: StepPath): void => {
    setFlowContainerPathState(normalizeContainerPath(currentEditorActionSteps, nextPath));
    setSelectedStepPath(null);
  };

  const enterBlockScope = (blockStepPath: StepPath): void => {
    const blockStep = getStepAtPath(currentEditorActionSteps, blockStepPath);
    if (!blockStep || !isBlockStepAction(blockStep.action)) {
      return;
    }
    setFlowContainerPathState(blockStepPath);
  };

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

  const { editorSaveButtonLabel, persistEditorDraft } = useEditorPersistence({
    closeEditorModal,
    config,
    editorDraft,
    editorMode,
    editorOriginalActionName,
    editorSaveStatus,
    isSavingEditor,
    lastSavedSnapshot,
    onSave,
    setEditorDraft,
    setEditorErrorMessage,
    setEditorOriginalActionName,
    setEditorSaveStatus,
    setIsSavingEditor,
    setLastSavedSnapshot,
    setShowValidationFeedback,
  });

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
    const newStep = createEmptyStep(newStepType);
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
    contextVariables,
    draftFieldValidationState,
    fieldValidationByKey,
    flowValidationBannerItems,
    editorDraft,
    editorErrorMessage,
    editorMode,
    editorSaveButtonLabel,
    editorSaveStatus,
    edges,
    flowBreadcrumbSegments,
    flowContainerPath: normalizedFlowContainerPath,
    hasBrowserSteps,
    isSavingEditor,
    jsonDraftByFieldId,
    jsonErrorByFieldId,
    nodes,
    selectedStep,
    selectedStepPath,
    selectedStepPathKey,
    addStepAtInsertionPoint,
    changeSelectedStepAction,
    closeEditorModal,
    deleteSelectedStep,
    enterBlockScope,
    openCreateEditor,
    openEditEditor,
    persistEditorDraft,
    setJsonDraftByFieldId,
    setJsonErrorByFieldId,
    setFlowContainerPath,
    setSelectedStepPath,
    updateActionName,
    updateBrowserProfile,
    updateSelectedStep,
  };
}
