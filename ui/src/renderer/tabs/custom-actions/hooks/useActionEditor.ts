import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { inferContextVariablesBeforeStep } from "../../../../shared/contextVars";
import type { ActionStep, AppConfig } from "../../../../shared/types";
import type {
  ActionEditorDraft,
  EditSaveStatus,
  EditorMode,
  FlowBreadcrumbSegment,
  InsertionPoint,
  StepPath,
  StepUpdater,
} from "../types";
import { actionUsesBrowserSteps } from "../utils/browserStepUtils";
import { buildFlowNodesAndEdges } from "../utils/flow";
import {
  type DraftFieldValidationKey,
  type FlowValidationBannerItem,
  type FlowValidationSeverity,
} from "../utils/flowValidationUtils";
import { getActionSteps } from "../utils/stepUtils";
import { useEditorLifecycle, useStepMutations } from "./useEditorLifecycle";
import { useEditorPersistence } from "./useEditorPersistence";
import { useEditorValidation } from "./useEditorValidation";
import { useFlowGraph } from "./useFlowGraph";
import { useFlowScope } from "./useFlowScope";
import { useSelectedStep } from "./useSelectedStep";

interface UseActionEditorInput {
  config: AppConfig;
  onSave: (nextConfig: AppConfig) => Promise<void>;
}

export interface UseActionEditorResult {
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
  const [editorSaveStatus, setEditorSaveStatus] = useState<EditSaveStatus>("saved");
  const [isSavingEditor, setIsSavingEditor] = useState(false);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState("");
  const [editorErrorMessage, setEditorErrorMessage] = useState<string | null>(null);
  const [jsonDraftByFieldId, setJsonDraftByFieldId] = useState<Record<string, string>>({});
  const [jsonErrorByFieldId, setJsonErrorByFieldId] = useState<Record<string, string>>({});
  const [showValidationFeedback, setShowValidationFeedback] = useState(false);

  const currentEditorActionSteps = useMemo(
    () => (editorDraft ? getActionSteps(editorDraft.actionConfig) : []),
    [editorDraft],
  );

  const { selectedStep, selectedStepPathKey } = useSelectedStep({
    currentEditorActionSteps,
    selectedStepPath,
  });

  const {
    enterBlockScope,
    flowBreadcrumbSegments,
    normalizedFlowContainerPath,
    setFlowContainerPath,
  } = useFlowScope({
    currentEditorActionSteps,
    editorActionName: editorDraft?.actionName ?? "",
    flowContainerPath,
    hasEditorDraft: Boolean(editorDraft),
    setFlowContainerPathState,
    setSelectedStepPath,
  });

  const {
    draftFieldValidationState,
    fieldValidationByKey,
    flowValidationBannerItems,
    stepValidationSeverityByKey,
  } = useEditorValidation({
    config,
    currentEditorActionSteps,
    editorDraft,
    editorErrorMessage,
    editorMode,
    editorOriginalActionName,
    selectedStepPath,
    showValidationFeedback,
  });

  const { edges, nodes } = useFlowGraph({
    currentEditorActionSteps,
    normalizedFlowContainerPath,
    stepValidationSeverityByKey,
  });

  const { closeEditorModal, openCreateEditor, openEditEditor } = useEditorLifecycle({
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
  });

  const {
    addStepAtInsertionPoint,
    changeSelectedStepAction,
    deleteSelectedStep,
    updateActionName,
    updateBrowserProfile,
    updateSelectedStep,
  } = useStepMutations({
    editorDraft,
    editorMode,
    lastSavedSnapshot,
    selectedStepPath,
    setEditorDraft,
    setEditorSaveStatus,
    setFlowContainerPathState,
    setSelectedStepPath,
  });

  const { editorSaveButtonLabel, persistEditorDraft } = useEditorPersistence({
    closeEditorModal,
    config,
    editorDraft,
    editorMode,
    editorOriginalActionName,
    editorSaveStatus,
    isSavingEditor,
    onSave,
    setEditorDraft,
    setEditorErrorMessage,
    setEditorOriginalActionName,
    setEditorSaveStatus,
    setIsSavingEditor,
    setLastSavedSnapshot,
    setShowValidationFeedback,
  });

  const hasBrowserSteps = useMemo(
    () => actionUsesBrowserSteps(currentEditorActionSteps),
    [currentEditorActionSteps],
  );

  const contextVariables = useMemo(
    () => inferContextVariablesBeforeStep(currentEditorActionSteps, selectedStepPath),
    [currentEditorActionSteps, selectedStepPath],
  );

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
