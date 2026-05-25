import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  inferContextVariables,
  validateContextReferences,
} from "../../../../shared/contextVars";
import type { ActionStep, AppConfig } from "../../../../shared/types";
import { SUPPORTED_ACTION_TYPES } from "../constants";
import type {
  ActionEditorDraft,
  EditSaveStatus,
  EditorMode,
  StepUpdater,
} from "../types";
import { serializeEditorDraft } from "../utils/actionConfigUtils";
import { buildFlowNodesAndEdges } from "../utils/flow";
import { cloneActionConfig, createEmptyStep, getActionSteps } from "../utils/stepUtils";
import { useEditorPersistence } from "./useEditorPersistence";

interface UseActionEditorInput {
  config: AppConfig;
  onSave: (nextConfig: AppConfig) => Promise<void>;
}

interface UseActionEditorResult {
  contextVariables: string[];
  contextWarnings: ReturnType<typeof validateContextReferences>;
  editorDraft: ActionEditorDraft | null;
  editorErrorMessage: string | null;
  editorMode: EditorMode;
  editorSaveButtonLabel: string;
  editorSaveStatus: EditSaveStatus;
  edges: ReturnType<typeof buildFlowNodesAndEdges>["edges"];
  isSavingEditor: boolean;
  jsonDraftByFieldId: Record<string, string>;
  jsonErrorByFieldId: Record<string, string>;
  nodes: ReturnType<typeof buildFlowNodesAndEdges>["nodes"];
  selectedStep: ActionStep | null;
  selectedStepIndex: number | null;
  addStepAtIndex: (insertionIndex: number) => void;
  changeSelectedStepAction: (nextActionType: string) => void;
  closeEditorModal: () => void;
  deleteSelectedStep: () => void;
  openCreateEditor: () => void;
  openEditEditor: (actionName: string) => void;
  persistEditorDraft: () => Promise<void>;
  setJsonDraftByFieldId: Dispatch<SetStateAction<Record<string, string>>>;
  setJsonErrorByFieldId: Dispatch<SetStateAction<Record<string, string>>>;
  setSelectedStepIndex: (nextIndex: number | null) => void;
  updateActionName: (nextActionName: string) => void;
  updateSelectedStep: (updater: StepUpdater) => void;
}

export function useActionEditor({
  config,
  onSave,
}: UseActionEditorInput): UseActionEditorResult {
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [editorOriginalActionName, setEditorOriginalActionName] = useState<
    string | null
  >(null);
  const [editorDraft, setEditorDraft] = useState<ActionEditorDraft | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const [newStepType] = useState(SUPPORTED_ACTION_TYPES[0]);
  const [editorSaveStatus, setEditorSaveStatus] =
    useState<EditSaveStatus>("saved");
  const [isSavingEditor, setIsSavingEditor] = useState(false);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState("");
  const [editorErrorMessage, setEditorErrorMessage] = useState<string | null>(null);
  const [jsonDraftByFieldId, setJsonDraftByFieldId] = useState<
    Record<string, string>
  >({});
  const [jsonErrorByFieldId, setJsonErrorByFieldId] = useState<
    Record<string, string>
  >({});

  const currentEditorActionSteps = useMemo(
    () => (editorDraft ? getActionSteps(editorDraft.actionConfig) : []),
    [editorDraft],
  );
  const selectedStep =
    selectedStepIndex !== null && selectedStepIndex >= 0
      ? (currentEditorActionSteps[selectedStepIndex] ?? null)
      : null;
  const { nodes, edges } = useMemo(
    () => buildFlowNodesAndEdges(currentEditorActionSteps),
    [currentEditorActionSteps],
  );
  const contextVariables = useMemo(
    () => inferContextVariables(currentEditorActionSteps),
    [currentEditorActionSteps],
  );
  const contextWarnings = useMemo(
    () => validateContextReferences(currentEditorActionSteps),
    [currentEditorActionSteps],
  );

  const closeEditorModal = (): void => {
    setEditorMode(null);
    setEditorOriginalActionName(null);
    setEditorDraft(null);
    setSelectedStepIndex(null);
    setEditorErrorMessage(null);
    setEditorSaveStatus("saved");
    setIsSavingEditor(false);
    setLastSavedSnapshot("");
    setJsonDraftByFieldId({});
    setJsonErrorByFieldId({});
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
  });

  const openCreateEditor = (): void => {
    const initialActionName = "new-action";
    const draft: ActionEditorDraft = {
      actionName: initialActionName,
      actionConfig: { steps: [] },
      customActionUi: { availableOnCLI: false, aliases: [initialActionName] },
    };
    setEditorMode("create");
    setEditorOriginalActionName(null);
    setEditorDraft(draft);
    setSelectedStepIndex(null);
    setEditorErrorMessage(null);
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
    setSelectedStepIndex(null);
    setEditorErrorMessage(null);
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
    if (selectedStepIndex === null) {
      return;
    }
    updateEditorDraft((previousDraft) => {
      const previousSteps = getActionSteps(previousDraft.actionConfig);
      const currentStep = previousSteps[selectedStepIndex];
      if (!currentStep) {
        return previousDraft;
      }
      const nextSteps = [...previousSteps];
      nextSteps[selectedStepIndex] = updater(currentStep);
      return {
        ...previousDraft,
        actionConfig: { ...previousDraft.actionConfig, steps: nextSteps },
      };
    });
  };

  const addStepAtIndex = (insertionIndex: number): void => {
    updateEditorDraft((previousDraft) => {
      const previousSteps = getActionSteps(previousDraft.actionConfig);
      const boundedInsertionIndex = Math.max(
        0,
        Math.min(insertionIndex, previousSteps.length),
      );
      const nextSteps = [...previousSteps];
      nextSteps.splice(boundedInsertionIndex, 0, createEmptyStep(newStepType));
      return {
        ...previousDraft,
        actionConfig: { ...previousDraft.actionConfig, steps: nextSteps },
      };
    });
    setSelectedStepIndex(insertionIndex);
  };

  const changeSelectedStepAction = (nextActionType: string): void => {
    if (selectedStepIndex === null) {
      return;
    }
    updateEditorDraft((previousDraft) => {
      const previousSteps = getActionSteps(previousDraft.actionConfig);
      const nextSteps = [...previousSteps];
      nextSteps[selectedStepIndex] = createEmptyStep(nextActionType);
      return {
        ...previousDraft,
        actionConfig: { ...previousDraft.actionConfig, steps: nextSteps },
      };
    });
  };

  const deleteSelectedStep = (): void => {
    if (selectedStepIndex === null) {
      return;
    }
    updateEditorDraft((previousDraft) => {
      const previousSteps = getActionSteps(previousDraft.actionConfig);
      const nextSteps = previousSteps.filter(
        (_step, index) => index !== selectedStepIndex,
      );
      return {
        ...previousDraft,
        actionConfig: { ...previousDraft.actionConfig, steps: nextSteps },
      };
    });
    setSelectedStepIndex(null);
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

  return {
    contextVariables,
    contextWarnings,
    editorDraft,
    editorErrorMessage,
    editorMode,
    editorSaveButtonLabel,
    editorSaveStatus,
    edges,
    isSavingEditor,
    jsonDraftByFieldId,
    jsonErrorByFieldId,
    nodes,
    selectedStep,
    selectedStepIndex,
    addStepAtIndex,
    changeSelectedStepAction,
    closeEditorModal,
    deleteSelectedStep,
    openCreateEditor,
    openEditEditor,
    persistEditorDraft,
    setJsonDraftByFieldId,
    setJsonErrorByFieldId,
    setSelectedStepIndex,
    updateActionName,
    updateSelectedStep,
  };
}
