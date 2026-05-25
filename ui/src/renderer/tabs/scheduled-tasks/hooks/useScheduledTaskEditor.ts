import { useCallback, useEffect, useMemo, useState } from "react";
import type { ScheduledTaskInput, ScheduledTaskRecord } from "../../../../shared/types";
import { EDIT_AUTOSAVE_DELAY_MS, EMPTY_FORM } from "../constants";
import type { ScheduledTaskEditorState } from "../types";
import {
  getSaveButtonLabel,
  parseTriggerTimes,
  serializeTaskDraft,
} from "../utils";

interface UseScheduledTaskEditorInput {
  createRequestToken: number;
  onCreateRequestConsumed?: () => void;
  refreshScheduledTasks: () => Promise<void>;
}

interface UseScheduledTaskEditorResult extends ScheduledTaskEditorState {
  closeModal: () => void;
  openCreate: () => void;
  openEdit: (task: ScheduledTaskRecord) => void;
  persistDraft: () => Promise<void>;
  setErrorMessage: (message: string | null) => void;
  updateDraft: (updater: (previousDraft: ScheduledTaskInput) => ScheduledTaskInput) => void;
  updateTriggerTimesInput: (nextValue: string) => void;
}

export function useScheduledTaskEditor({
  createRequestToken,
  onCreateRequestConsumed,
  refreshScheduledTasks,
}: UseScheduledTaskEditorInput): UseScheduledTaskEditorResult {
  const [modalMode, setModalMode] = useState<ScheduledTaskEditorState["modalMode"]>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<ScheduledTaskInput>(EMPTY_FORM);
  const [triggerTimesInput, setTriggerTimesInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editSaveStatus, setEditSaveStatus] =
    useState<ScheduledTaskEditorState["editSaveStatus"]>("saved");
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState("");

  const closeModal = useCallback((): void => {
    setModalMode(null);
    setErrorMessage(null);
    setIsSaving(false);
  }, []);

  const openCreate = useCallback((): void => {
    setDraft(EMPTY_FORM);
    setTriggerTimesInput("");
    setErrorMessage(null);
    setEditSaveStatus("dirty");
    setLastSavedSnapshot("");
    setModalMode("create");
  }, []);

  useEffect(() => {
    if (createRequestToken <= 0) {
      return;
    }
    openCreate();
    onCreateRequestConsumed?.();
  }, [createRequestToken, onCreateRequestConsumed, openCreate]);

  const openEdit = useCallback((task: ScheduledTaskRecord): void => {
    const taskDraft: ScheduledTaskInput = {
      originalFileName: task.fileName,
      actionName: task.actionName,
      triggerTimes: task.triggerTimes,
      weekdays: task.weekdays,
      command: task.command,
    };
    const taskTriggerTimesInput = task.triggerTimes.join(", ");
    setDraft(taskDraft);
    setTriggerTimesInput(taskTriggerTimesInput);
    setErrorMessage(null);
    setEditSaveStatus("saved");
    setLastSavedSnapshot(serializeTaskDraft(taskDraft, taskTriggerTimesInput));
    setModalMode("edit");
  }, []);

  const updateDraft = useCallback(
    (updater: (previousDraft: ScheduledTaskInput) => ScheduledTaskInput): void => {
      setDraft((previousDraft) => {
        const nextDraft = updater(previousDraft);
        if (modalMode === "edit") {
          const nextSnapshot = serializeTaskDraft(nextDraft, triggerTimesInput);
          setEditSaveStatus(nextSnapshot === lastSavedSnapshot ? "saved" : "dirty");
        }
        return nextDraft;
      });
    },
    [lastSavedSnapshot, modalMode, triggerTimesInput]
  );

  const updateTriggerTimesInput = useCallback(
    (nextValue: string): void => {
      setTriggerTimesInput(nextValue);
      if (modalMode === "edit") {
        const nextSnapshot = serializeTaskDraft(draft, nextValue);
        setEditSaveStatus(nextSnapshot === lastSavedSnapshot ? "saved" : "dirty");
      }
    },
    [draft, lastSavedSnapshot, modalMode]
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
      const payload: ScheduledTaskInput = {
        ...draft,
        triggerTimes: parseTriggerTimes(triggerTimesInput),
      };

      await window.api.scheduledTasks.save(payload);
      await refreshScheduledTasks();

      if (modalMode === "create") {
        closeModal();
        return;
      }

      const savedSnapshot = serializeTaskDraft(payload, triggerTimesInput);
      setDraft(payload);
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
  }, [closeModal, draft, modalMode, refreshScheduledTasks, triggerTimesInput]);

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
  }, [modalMode, editSaveStatus, isSaving, draft, triggerTimesInput, persistDraft]);

  const saveButtonLabel = useMemo(
    () => getSaveButtonLabel(modalMode, editSaveStatus, isSaving),
    [editSaveStatus, isSaving, modalMode]
  );

  return {
    modalMode,
    isSaving,
    draft,
    triggerTimesInput,
    errorMessage,
    editSaveStatus,
    saveButtonLabel,
    closeModal,
    openCreate,
    openEdit,
    persistDraft,
    setErrorMessage,
    updateDraft,
    updateTriggerTimesInput,
  };
}
