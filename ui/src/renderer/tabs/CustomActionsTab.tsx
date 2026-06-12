import { useEffect, useMemo } from "react";
import type { AppConfig } from "../../shared/types";
import { useAppCommandBridge } from "../context/AppCommandBridge";
import { useTranslation } from "../i18n";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { useDeleteConfirmModal } from "../hooks/useDeleteConfirmModal";
import { ActionEditorModal } from "./custom-actions/components/ActionEditorModal";
import { CustomActionsList } from "./custom-actions/components/CustomActionsList";
import { RunActionModal } from "./custom-actions/components/RunActionModal";
import { ActionEditorProvider } from "./custom-actions/context/ActionEditorContext";
import { useActionEditor } from "./custom-actions/hooks/useActionEditor";
import { useActionRows } from "./custom-actions/hooks/useActionRows";
import { useRunActionModal } from "./custom-actions/hooks/useRunActionModal";
import { filterCustomActionNames } from "./custom-actions/utils/customActionSearch";

interface Props {
  config: AppConfig;
  onSave: (nextConfig: AppConfig) => Promise<void>;
  searchQuery: string;
}

export function CustomActionsTab({ config, onSave, searchQuery }: Props): JSX.Element {
  const { t } = useTranslation();
  const { registerCustomActionCreate } = useAppCommandBridge();
  const rows = useActionRows({ config, onSave });
  const editor = useActionEditor({ config, onSave });
  const runModal = useRunActionModal();
  const deleteModal = useDeleteConfirmModal({ deleteItem: rows.deleteAction });

  useEffect(() => {
    return registerCustomActionCreate(editor.openCreateEditor);
  }, [editor.openCreateEditor, registerCustomActionCreate]);

  const visibleActionNames = useMemo(
    () => filterCustomActionNames(rows.actionNames, config, searchQuery),
    [rows.actionNames, config, searchQuery],
  );

  const configuredActionNames = useMemo(() => {
    const actionNames = new Set(Object.keys(config.actionRunner));
    if (editor.editorDraft?.actionName.trim()) {
      actionNames.add(editor.editorDraft.actionName.trim());
    }
    return Array.from(actionNames).sort((leftName, rightName) => leftName.localeCompare(rightName));
  }, [config.actionRunner, editor.editorDraft?.actionName]);

  return (
    <section className="dashed-section">
      {visibleActionNames.length === 0 ? (
        <div className="info-banner">{t.customActions.noSearchResults}</div>
      ) : null}
      <CustomActionsList
        actionNames={visibleActionNames}
        aliasDraftByActionName={rows.aliasDraftByActionName}
        config={config}
        onEditAction={editor.openEditEditor}
        onRequestDeleteAction={deleteModal.openDeleteModal}
        onRunAction={(actionName) =>
          runModal.openRunModal({
            actionName,
            actionConfig: config.actionRunner[actionName],
          })
        }
        rowPendingByActionName={rows.rowPendingByActionName}
        saveRowMetadata={rows.saveRowMetadata}
        setAliasDraftByActionName={rows.setAliasDraftByActionName}
      />

      {rows.rowSaveErrorMessage ? (
        <div className="error-banner">{rows.rowSaveErrorMessage}</div>
      ) : null}

      {editor.editorMode && editor.editorDraft ? (
        <ActionEditorProvider
          actionRunner={config.actionRunner}
          configuredActionNames={configuredActionNames}
          editor={editor}
        >
          <ActionEditorModal />
        </ActionEditorProvider>
      ) : null}

      {runModal.runActionName ? (
        <RunActionModal
          closeRunModal={runModal.closeRunModal}
          isRunningAction={runModal.isRunningAction}
          runAction={runModal.runAction}
          runActionFeedback={runModal.runActionFeedback}
          runActionName={runModal.runActionName}
          runArgsDraft={runModal.runArgsDraft}
          setRunArgsDraft={runModal.setRunArgsDraft}
        />
      ) : null}

      {deleteModal.pendingDelete ? (
        <DeleteConfirmModal
          closeDeleteModal={deleteModal.closeDeleteModal}
          confirmDelete={deleteModal.confirmDelete}
          errorMessage={rows.rowSaveErrorMessage}
          isDeleting={deleteModal.isDeleting}
          itemName={deleteModal.pendingDelete.label}
          variant="customAction"
        />
      ) : null}
    </section>
  );
}
