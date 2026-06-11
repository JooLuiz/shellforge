import { useEffect, useMemo } from "react";
import type { AppConfig } from "../../shared/types";
import { ActionEditorModal } from "./custom-actions/components/ActionEditorModal";
import { CustomActionsList } from "./custom-actions/components/CustomActionsList";
import { DeleteActionModal } from "./custom-actions/components/DeleteActionModal";
import { RunActionModal } from "./custom-actions/components/RunActionModal";
import { useActionEditor } from "./custom-actions/hooks/useActionEditor";
import { useActionRows } from "./custom-actions/hooks/useActionRows";
import { useDeleteActionModal } from "./custom-actions/hooks/useDeleteActionModal";
import { useRunActionModal } from "./custom-actions/hooks/useRunActionModal";
import { filterCustomActionNames } from "./custom-actions/utils/customActionSearch";

interface Props {
  config: AppConfig;
  onSave: (nextConfig: AppConfig) => Promise<void>;
  searchQuery: string;
  createRequestToken?: number;
  onCreateRequestConsumed?: () => void;
}

export function CustomActionsTab({
  config,
  onSave,
  searchQuery,
  createRequestToken = 0,
  onCreateRequestConsumed,
}: Props): JSX.Element {
  const rows = useActionRows({ config, onSave });
  const editor = useActionEditor({ config, onSave });
  const runModal = useRunActionModal();
  const deleteModal = useDeleteActionModal({ deleteAction: rows.deleteAction });

  useEffect(() => {
    if (createRequestToken <= 0) {
      return;
    }
    editor.openCreateEditor();
    onCreateRequestConsumed?.();
  }, [createRequestToken, onCreateRequestConsumed]);

  const visibleActionNames = useMemo(
    () => filterCustomActionNames(rows.actionNames, config, searchQuery),
    [rows.actionNames, config, searchQuery]
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
        <div className="info-banner">No custom actions match the current search.</div>
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
        <ActionEditorModal
          actionRunner={config.actionRunner}
          addStepAtInsertionPoint={editor.addStepAtInsertionPoint}
          changeSelectedStepAction={editor.changeSelectedStepAction}
          closeEditorModal={editor.closeEditorModal}
          configuredActionNames={configuredActionNames}
          contextVariables={editor.contextVariables}
          deleteSelectedStep={editor.deleteSelectedStep}
          draftFieldValidationState={editor.draftFieldValidationState}
          editorDraft={editor.editorDraft}
          editorMode={editor.editorMode}
          editorSaveButtonLabel={editor.editorSaveButtonLabel}
          editorSaveStatus={editor.editorSaveStatus}
          edges={editor.edges}
          enterBlockScope={editor.enterBlockScope}
          fieldValidationByKey={editor.fieldValidationByKey}
          flowBreadcrumbSegments={editor.flowBreadcrumbSegments}
          flowContainerPath={editor.flowContainerPath}
          flowValidationBannerItems={editor.flowValidationBannerItems}
          hasBrowserSteps={editor.hasBrowserSteps}
          isSavingEditor={editor.isSavingEditor}
          jsonDraftByFieldId={editor.jsonDraftByFieldId}
          jsonErrorByFieldId={editor.jsonErrorByFieldId}
          nodes={editor.nodes}
          persistEditorDraft={editor.persistEditorDraft}
          selectedStep={editor.selectedStep}
          selectedStepPath={editor.selectedStepPath}
          selectedStepPathKey={editor.selectedStepPathKey}
          setJsonDraftByFieldId={editor.setJsonDraftByFieldId}
          setJsonErrorByFieldId={editor.setJsonErrorByFieldId}
          setFlowContainerPath={editor.setFlowContainerPath}
          setSelectedStepPath={editor.setSelectedStepPath}
          updateActionName={editor.updateActionName}
          updateBrowserProfile={editor.updateBrowserProfile}
          updateSelectedStep={editor.updateSelectedStep}
        />
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

      {deleteModal.deleteActionName ? (
        <DeleteActionModal
          actionName={deleteModal.deleteActionName}
          closeDeleteModal={deleteModal.closeDeleteModal}
          confirmDelete={deleteModal.confirmDelete}
          isDeleting={deleteModal.isDeleting}
        />
      ) : null}
    </section>
  );
}
