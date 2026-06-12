import { useEffect, useMemo } from "react";
import type { ScheduledTaskRecord } from "../../shared/types";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { useAppCommandBridge } from "../context/AppCommandBridge";
import { useDeleteConfirmModal } from "../hooks/useDeleteConfirmModal";
import { useTranslation } from "../i18n";
import { ScheduledTaskModal } from "./scheduled-tasks/components/ScheduledTaskModal";
import { ScheduledTaskPrivilegesBanner } from "./scheduled-tasks/components/ScheduledTaskPrivilegesBanner";
import { ScheduledTasksList } from "./scheduled-tasks/components/ScheduledTasksList";
import { useScheduledTaskActions } from "./scheduled-tasks/hooks/useScheduledTaskActions";
import { useScheduledTaskEditor } from "./scheduled-tasks/hooks/useScheduledTaskEditor";
import { useScheduledTaskPrivileges } from "./scheduled-tasks/hooks/useScheduledTaskPrivileges";
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
}: ScheduledTasksTabProps): JSX.Element {
  const { t } = useTranslation();
  const { registerScheduledTaskCreate } = useAppCommandBridge();
  const editor = useScheduledTaskEditor({
    actionRunner,
    customActions,
    refreshScheduledTasks,
  });

  useEffect(() => {
    return registerScheduledTaskCreate(editor.openCreate);
  }, [editor.openCreate, registerScheduledTaskCreate]);

  const actions = useScheduledTaskActions({
    refreshScheduledTasks,
    setErrorMessage: editor.setErrorMessage,
    toggleErrorMessages: {
      adminRequiredErrorMessage: t.scheduledTasks.privileges.toggleError,
      invalidActionNameMessage: t.scheduledTasks.invalidActionName,
      toggleFailedMessage: t.scheduledTasks.toggleFailed,
      toggleRegistrationFailedMessage: t.scheduledTasks.toggleRegistrationFailed,
    },
  });
  const privileges = useScheduledTaskPrivileges();
  const deleteModal = useDeleteConfirmModal({ deleteItem: actions.deleteScheduledTask });
  const canManageTasks = privileges.isAdministrator;

  const sortedTasks = useMemo(
    () => [...scheduledTasks].sort((leftTask, rightTask) => leftTask.fileName.localeCompare(rightTask.fileName)),
    [scheduledTasks],
  );

  const visibleTasks = useMemo(
    () => filterScheduledTasks(sortedTasks, searchQuery),
    [sortedTasks, searchQuery],
  );

  const normalizedCommandOptions = useMemo(
    () => normalizeCommandOptions(commandOptions),
    [commandOptions],
  );

  const openEdit = (task: ScheduledTaskRecord): void => {
    editor.openEdit(task);
  };

  return (
    <section className="dashed-section">
      {isLoadingScheduledTasks ? (
        <div className="info-banner">{t.app.loading}</div>
      ) : null}
      {scheduledTasksLoadError ? (
        <div className="error-banner">{scheduledTasksLoadError}</div>
      ) : null}
      {privileges.loadError ? (
        <div className="error-banner">{privileges.loadError}</div>
      ) : null}
      {!privileges.isLoading ? (
        <ScheduledTaskPrivilegesBanner isVisible={!canManageTasks} />
      ) : null}

      {visibleTasks.length === 0 && !isLoadingScheduledTasks && !scheduledTasksLoadError ? (
        <div className="info-banner">{t.scheduledTasks.noSearchResults}</div>
      ) : null}

      <ScheduledTasksList
        tasks={visibleTasks}
        togglingTaskNames={actions.togglingTaskNames}
        canManageTasks={canManageTasks}
        invalidActionNameMessage={t.scheduledTasks.invalidActionName}
        onEditTask={openEdit}
        onRequestRemoveTask={deleteModal.openDeleteModal}
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
      {deleteModal.pendingDelete ? (
        <DeleteConfirmModal
          closeDeleteModal={deleteModal.closeDeleteModal}
          confirmDelete={deleteModal.confirmDelete}
          errorMessage={editor.errorMessage}
          isDeleting={deleteModal.isDeleting}
          itemName={deleteModal.pendingDelete.label}
          variant="scheduledTask"
        />
      ) : null}
    </section>
  );
}
