import { useCallback, useEffect, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import type {
  ActionConfig,
  AppConfig,
  CustomActionUiConfig,
} from "../../../../shared/types";
import type {
  ActionEditorDraft,
  EditSaveStatus,
  EditorMode,
} from "../types";
import {
  renameInvokeActionReferencesInConfig,
  serializeEditorDraft,
} from "../utils/actionConfigUtils";
import { cloneActionConfig } from "../utils/stepUtils";

interface UseEditorPersistenceInput {
  closeEditorModal: () => void;
  config: AppConfig;
  editorDraft: ActionEditorDraft | null;
  editorMode: EditorMode;
  editorOriginalActionName: string | null;
  editorSaveStatus: EditSaveStatus;
  isSavingEditor: boolean;
  lastSavedSnapshot: string;
  onSave: (nextConfig: AppConfig) => Promise<void>;
  setEditorDraft: Dispatch<SetStateAction<ActionEditorDraft | null>>;
  setEditorErrorMessage: (message: string | null) => void;
  setEditorOriginalActionName: (actionName: string | null) => void;
  setEditorSaveStatus: (status: EditSaveStatus) => void;
  setIsSavingEditor: (isSaving: boolean) => void;
  setLastSavedSnapshot: (snapshot: string) => void;
}

interface UseEditorPersistenceResult {
  editorSaveButtonLabel: string;
  persistEditorDraft: () => Promise<void>;
}

export function useEditorPersistence({
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
}: UseEditorPersistenceInput): UseEditorPersistenceResult {
  const persistEditorDraft = useCallback(async (): Promise<void> => {
    if (!editorDraft || !editorMode) {
      return;
    }
    const nextActionName = editorDraft.actionName.trim();
    if (!nextActionName) {
      setEditorErrorMessage("Action name cannot be empty.");
      return;
    }
    const isRenaming =
      editorMode === "edit" && editorOriginalActionName !== nextActionName;
    const actionNameAlreadyExists =
      config.actionRunner[nextActionName] &&
      (!isRenaming || editorOriginalActionName !== nextActionName);
    if (actionNameAlreadyExists) {
      setEditorErrorMessage(`Action "${nextActionName}" already exists.`);
      return;
    }
    setEditorErrorMessage(null);
    setIsSavingEditor(true);
    if (editorMode === "edit") {
      setEditorSaveStatus("saving");
    }

    try {
      let nextActionRunner: Record<string, ActionConfig> = { ...config.actionRunner };
      let nextCustomActions: Record<string, CustomActionUiConfig> = {
        ...config.ui.customActions,
      };
      if (editorMode === "create") {
        nextActionRunner[nextActionName] = cloneActionConfig(editorDraft.actionConfig);
        nextCustomActions[nextActionName] = {
          ...editorDraft.customActionUi,
          aliases:
            editorDraft.customActionUi.aliases.length > 0
              ? editorDraft.customActionUi.aliases
              : [nextActionName],
        };
      } else if (editorOriginalActionName) {
        if (isRenaming) {
          const renamedEntries = Object.entries(config.actionRunner).map(
            ([actionName, actionConfig]) => {
              if (actionName === editorOriginalActionName) {
                return [nextActionName, cloneActionConfig(editorDraft.actionConfig)] as const;
              }
              return [
                actionName,
                renameInvokeActionReferencesInConfig(
                  actionConfig,
                  editorOriginalActionName,
                  nextActionName,
                ),
              ] as const;
            },
          );
          nextActionRunner = Object.fromEntries(renamedEntries);
          nextCustomActions = { ...config.ui.customActions };
          delete nextCustomActions[editorOriginalActionName];
          nextCustomActions[nextActionName] = {
            ...editorDraft.customActionUi,
            aliases:
              editorDraft.customActionUi.aliases.length > 0
                ? editorDraft.customActionUi.aliases.map((alias) =>
                    alias === editorOriginalActionName ? nextActionName : alias,
                  )
                : [nextActionName],
          };
        } else {
          nextActionRunner[editorOriginalActionName] = cloneActionConfig(
            editorDraft.actionConfig,
          );
          nextCustomActions[editorOriginalActionName] = {
            ...editorDraft.customActionUi,
            aliases:
              editorDraft.customActionUi.aliases.length > 0
                ? editorDraft.customActionUi.aliases
                : [editorOriginalActionName],
          };
        }
      }

      await onSave({
        ...config,
        actionRunner: nextActionRunner,
        ui: { ...config.ui, customActions: nextCustomActions },
      });
      if (editorMode === "create") {
        closeEditorModal();
        return;
      }
      const persistedDraft: ActionEditorDraft = {
        ...editorDraft,
        actionName: nextActionName,
      };
      setEditorDraft(persistedDraft);
      setEditorOriginalActionName(nextActionName);
      setLastSavedSnapshot(serializeEditorDraft(persistedDraft));
      setEditorSaveStatus("saved");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown save error";
      setEditorErrorMessage(message);
      if (editorMode === "edit") {
        setEditorSaveStatus("dirty");
      }
    } finally {
      setIsSavingEditor(false);
    }
  }, [
    closeEditorModal,
    config,
    editorDraft,
    editorMode,
    editorOriginalActionName,
    onSave,
    setEditorDraft,
    setEditorErrorMessage,
    setEditorOriginalActionName,
    setEditorSaveStatus,
    setIsSavingEditor,
    setLastSavedSnapshot,
  ]);

  useEffect(() => {
    if (editorMode !== "edit" || editorSaveStatus !== "dirty" || isSavingEditor) {
      return;
    }
    const saveTimeout = window.setTimeout(() => {
      void persistEditorDraft();
    }, 10000);
    return () => window.clearTimeout(saveTimeout);
  }, [editorMode, editorSaveStatus, isSavingEditor, persistEditorDraft]);

  const editorSaveButtonLabel = useMemo(() => {
    if (editorMode === "edit") {
      if (editorSaveStatus === "saving") {
        return "Saving...";
      }
      if (editorSaveStatus === "saved") {
        return "Saved";
      }
      return "Save";
    }
    return isSavingEditor ? "Saving..." : "Save";
  }, [editorMode, editorSaveStatus, isSavingEditor]);

  return {
    editorSaveButtonLabel,
    persistEditorDraft,
  };
}
