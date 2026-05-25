import { useMemo } from "react";
import type { ScheduledTaskRecord } from "../../shared/types";
import { ScheduledTaskModal } from "./scheduled-tasks/components/ScheduledTaskModal";
import { ScheduledTasksList } from "./scheduled-tasks/components/ScheduledTasksList";
import { useScheduledTaskActions } from "./scheduled-tasks/hooks/useScheduledTaskActions";
import { useScheduledTaskEditor } from "./scheduled-tasks/hooks/useScheduledTaskEditor";
import type { ScheduledTasksTabProps } from "./scheduled-tasks/types";
import { normalizeCommandOptions } from "./scheduled-tasks/utils";

export function ScheduledTasksTab({
  scheduledTasks,
  refreshScheduledTasks,
  commandOptions,
  createRequestToken = 0,
  onCreateRequestConsumed,
}: ScheduledTasksTabProps): JSX.Element {
  const editor = useScheduledTaskEditor({
    createRequestToken,
    onCreateRequestConsumed,
    refreshScheduledTasks,
  });

  const actions = useScheduledTaskActions({
    refreshScheduledTasks,
    setErrorMessage: editor.setErrorMessage,
  });

  const sortedTasks = useMemo(
    () => [...scheduledTasks].sort((leftTask, rightTask) => leftTask.fileName.localeCompare(rightTask.fileName)),
    [scheduledTasks]
  );

  const normalizedCommandOptions = useMemo(
    () => normalizeCommandOptions(commandOptions),
    [commandOptions]
  );

  const openEdit = (task: ScheduledTaskRecord): void => {
    editor.openEdit(task);
  };

  return (
    <section className="dashed-section">
      <ScheduledTasksList
        tasks={sortedTasks}
        togglingTaskNames={actions.togglingTaskNames}
        onEditTask={openEdit}
        onRemoveTask={actions.removeTask}
        onToggleTask={actions.toggleTask}
      />

      {editor.errorMessage && editor.modalMode === null ? (
        <div className="error-banner">{editor.errorMessage}</div>
      ) : null}

      {editor.modalMode ? (
        <ScheduledTaskModal
          commandOptions={normalizedCommandOptions}
          draft={editor.draft}
          editSaveStatus={editor.editSaveStatus}
          errorMessage={editor.errorMessage}
          isSaving={editor.isSaving}
          modalMode={editor.modalMode}
          onClose={editor.closeModal}
          onPersist={editor.persistDraft}
          onUpdateDraft={editor.updateDraft}
          onUpdateTriggerTimesInput={editor.updateTriggerTimesInput}
          saveButtonLabel={editor.saveButtonLabel}
          triggerTimesInput={editor.triggerTimesInput}
        />
      ) : null}
    </section>
  );
}
