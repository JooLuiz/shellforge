import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ActionConfig,
  CustomActionUiConfig,
  ScheduledTaskInput,
  ScheduledTaskRecord,
} from "../../../../shared/types";
import type { ScheduledCommandDraft } from "../../../../shared/scheduledTaskCommand";
import { EDIT_AUTOSAVE_DELAY_MS, EMPTY_FORM } from "../constants";
import type { ScheduledTaskEditorState } from "../types";
import { getSaveButtonLabel, serializeTaskDraft } from "../utils";
import {
  applyAliasSelection,
  applyCommandInputChange,
  createEmptyCommandDraft,
  hydrateCommandDraft,
  mergeCommandDraftIntoTaskInput,
  resolveArgumentSchema,
} from "../utils/scheduledTaskCommandDraft";
import { getCommandInputValue } from "../../../../shared/scheduledTaskCommand";

interface UseScheduledTaskEditorInput {
  actionRunner: Record<string, ActionConfig>;
  customActions: Record<string, CustomActionUiConfig>;
  refreshScheduledTasks: () => Promise<void>;
}

interface UseScheduledTaskEditorResult extends ScheduledTaskEditorState {
  argumentSchema: ReturnType<typeof resolveArgumentSchema>;
  closeModal: () => void;
  commandDraft: ScheduledCommandDraft;
  openCreate: () => void;
  openEdit: (task: ScheduledTaskRecord) => void;
  persistDraft: () => Promise<void>;
  setErrorMessage: (message: string | null) => void;
  updateCommandDraft: (updater: (previousDraft: ScheduledCommandDraft) => ScheduledCommandDraft) => void;
  updateDraft: (updater: (previousDraft: ScheduledTaskInput) => ScheduledTaskInput) => void;
}

function markEditDirty(
  nextDraft: ScheduledTaskInput,
  lastSavedSnapshot: string,
): ScheduledTaskEditorState["editSaveStatus"] {
  const nextSnapshot = serializeTaskDraft(nextDraft);
  return nextSnapshot === lastSavedSnapshot ? "saved" : "dirty";
}

function syncTaskInputFromCommandDraft(
  taskInput: ScheduledTaskInput,
  commandDraft: ScheduledCommandDraft,
): ScheduledTaskInput {
  return mergeCommandDraftIntoTaskInput(taskInput, commandDraft);
}

export function useScheduledTaskEditor({
  actionRunner,
  customActions,
  refreshScheduledTasks,
}: UseScheduledTaskEditorInput): UseScheduledTaskEditorResult {
  const [modalMode, setModalMode] = useState<ScheduledTaskEditorState["modalMode"]>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<ScheduledTaskInput>(EMPTY_FORM);
  const [commandDraft, setCommandDraft] = useState<ScheduledCommandDraft>(createEmptyCommandDraft());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editSaveStatus, setEditSaveStatus] =
    useState<ScheduledTaskEditorState["editSaveStatus"]>("saved");
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState("");

  const argumentSchema = useMemo(
    () => resolveArgumentSchema(commandDraft, actionRunner),
    [actionRunner, commandDraft],
  );

  const applyCommandDraftUpdate = useCallback(
    (nextCommandDraft: ScheduledCommandDraft): void => {
      setCommandDraft(nextCommandDraft);
      setDraft((previousTaskDraft) => {
        const nextTaskDraft = syncTaskInputFromCommandDraft(previousTaskDraft, nextCommandDraft);
        if (modalMode === "edit") {
          setEditSaveStatus(markEditDirty(nextTaskDraft, lastSavedSnapshot));
        }
        return nextTaskDraft;
      });
    },
    [lastSavedSnapshot, modalMode],
  );

  const closeModal = useCallback((): void => {
    setModalMode(null);
    setErrorMessage(null);
    setIsSaving(false);
  }, []);

  const openCreate = useCallback((): void => {
    const emptyCommandDraft = createEmptyCommandDraft();
    setCommandDraft(emptyCommandDraft);
    setDraft(syncTaskInputFromCommandDraft(EMPTY_FORM, emptyCommandDraft));
    setErrorMessage(null);
    setEditSaveStatus("dirty");
    setLastSavedSnapshot("");
    setModalMode("create");
  }, []);

  const openEdit = useCallback(
    (task: ScheduledTaskRecord): void => {
      const hydratedCommandDraft = hydrateCommandDraft(
        task.command,
        task.commandMetadata,
        customActions,
      );
      const taskDraft: ScheduledTaskInput = syncTaskInputFromCommandDraft(
        {
          originalFileName: task.fileName,
          actionName: task.actionName,
          triggerTimes: task.triggerTimes,
          weekdays: task.weekdays,
          command: task.command,
          commandMetadata: task.commandMetadata,
        },
        hydratedCommandDraft,
      );

      setCommandDraft(hydratedCommandDraft);
      setDraft(taskDraft);
      setErrorMessage(null);
      setEditSaveStatus("saved");
      setLastSavedSnapshot(serializeTaskDraft(taskDraft));
      setModalMode("edit");
    },
    [customActions],
  );

  const updateDraft = useCallback(
    (updater: (previousDraft: ScheduledTaskInput) => ScheduledTaskInput): void => {
      setDraft((previousDraft) => {
        const nextDraft = updater(previousDraft);
        if (modalMode === "edit") {
          setEditSaveStatus(markEditDirty(nextDraft, lastSavedSnapshot));
        }
        return nextDraft;
      });
    },
    [lastSavedSnapshot, modalMode],
  );

  const updateCommandDraft = useCallback(
    (updater: (previousDraft: ScheduledCommandDraft) => ScheduledCommandDraft): void => {
      setCommandDraft((previousCommandDraft) => {
        const intermediateDraft = updater(previousCommandDraft);
        const previousInput = getCommandInputValue(previousCommandDraft);
        const nextInput = getCommandInputValue(intermediateDraft);

        let nextCommandDraft = intermediateDraft;

        if (nextInput !== previousInput) {
          nextCommandDraft = applyCommandInputChange(
            previousCommandDraft,
            nextInput,
            customActions,
            actionRunner,
          );
          nextCommandDraft = {
            ...nextCommandDraft,
            verbose: intermediateDraft.verbose,
            actionArgs:
              nextCommandDraft.kind === "customActionAlias" &&
              nextCommandDraft.actionName === previousCommandDraft.actionName
                ? intermediateDraft.actionArgs
                : nextCommandDraft.actionArgs,
          };
        } else if (
          intermediateDraft.kind === "customActionAlias" &&
          intermediateDraft.alias.trim()
        ) {
          nextCommandDraft = applyAliasSelection(
            intermediateDraft,
            intermediateDraft.alias,
            customActions,
            actionRunner,
          );
          nextCommandDraft = {
            ...nextCommandDraft,
            verbose: intermediateDraft.verbose,
            actionArgs: intermediateDraft.actionArgs,
          };
        }

        applyCommandDraftUpdate(nextCommandDraft);
        return nextCommandDraft;
      });
    },
    [actionRunner, applyCommandDraftUpdate, customActions],
  );

  const persistDraft = useCallback(async (): Promise<void> => {
    if (!modalMode) {
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);
    if (modalMode === "edit") {
      setEditSaveStatus("saving");
    }

    try {
      await window.api.scheduledTasks.save(draft);
      await refreshScheduledTasks();

      if (modalMode === "create") {
        closeModal();
        return;
      }

      const savedSnapshot = serializeTaskDraft(draft);
      setLastSavedSnapshot(savedSnapshot);
      setEditSaveStatus("saved");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown save error";
      setErrorMessage(message);
      if (modalMode === "edit") {
        setEditSaveStatus("dirty");
      }
    } finally {
      setIsSaving(false);
    }
  }, [closeModal, draft, modalMode, refreshScheduledTasks]);

  useEffect(() => {
    if (modalMode !== "edit" || editSaveStatus !== "dirty" || isSaving) {
      return;
    }

    const saveTimeout = window.setTimeout(() => {
      void persistDraft();
    }, EDIT_AUTOSAVE_DELAY_MS);

    return () => {
      window.clearTimeout(saveTimeout);
    };
  }, [modalMode, editSaveStatus, isSaving, draft, persistDraft]);

  const saveButtonLabel = useMemo(
    () => getSaveButtonLabel(modalMode, editSaveStatus, isSaving),
    [editSaveStatus, isSaving, modalMode],
  );

  return {
    modalMode,
    isSaving,
    draft,
    commandDraft,
    argumentSchema,
    errorMessage,
    editSaveStatus,
    saveButtonLabel,
    closeModal,
    openCreate,
    openEdit,
    persistDraft,
    setErrorMessage,
    updateDraft,
    updateCommandDraft,
  };
}
