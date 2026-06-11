import { useMemo } from "react";
import type { ScheduledTaskRecord } from "../../shared/types";
import { ScheduledTaskModal } from "./scheduled-tasks/components/ScheduledTaskModal";
import { ScheduledTasksList } from "./scheduled-tasks/components/ScheduledTasksList";
import { useScheduledTaskActions } from "./scheduled-tasks/hooks/useScheduledTaskActions";
import { useScheduledTaskEditor } from "./scheduled-tasks/hooks/useScheduledTaskEditor";
import type { ScheduledTasksTabProps } from "./scheduled-tasks/types";
import { normalizeCommandOptions } from "./scheduled-tasks/utils";
import { filterScheduledTasks } from "./scheduled-tasks/utils/scheduledTaskSearch";

export function ScheduledTasksTab({
  actionRunner,
  customActions,
  scheduledTasks,
  refreshScheduledTasks,
  isLoadingScheduledTasks,
  scheduledTasksLoadError,
  commandOptions,
  searchQuery,
  createRequestToken = 0,
  onCreateRequestConsumed,
}: ScheduledTasksTabProps): JSX.Element {
  const editor = useScheduledTaskEditor({
    actionRunner,
    customActions,
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

  const visibleTasks = useMemo(
    () => filterScheduledTasks(sortedTasks, searchQuery),
    [sortedTasks, searchQuery]
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
      {isLoadingScheduledTasks ? (
        <div className="info-banner">Loading scheduled tasks...</div>
      ) : null}
      {scheduledTasksLoadError ? (
        <div className="error-banner">{scheduledTasksLoadError}</div>
      ) : null}

      {visibleTasks.length === 0 && !isLoadingScheduledTasks && !scheduledTasksLoadError ? (
        <div className="info-banner">No scheduled tasks match the current search.</div>
      ) : null}

      <ScheduledTasksList
        tasks={visibleTasks}
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
          argumentSchema={editor.argumentSchema}
          commandDraft={editor.commandDraft}
          commandOptions={normalizedCommandOptions}
          draft={editor.draft}
          editSaveStatus={editor.editSaveStatus}
          errorMessage={editor.errorMessage}
          isSaving={editor.isSaving}
          modalMode={editor.modalMode}
          onClose={editor.closeModal}
          onPersist={editor.persistDraft}
          onUpdateCommandDraft={editor.updateCommandDraft}
          onUpdateDraft={editor.updateDraft}
          saveButtonLabel={editor.saveButtonLabel}
        />
      ) : null}
    </section>
  );
}
