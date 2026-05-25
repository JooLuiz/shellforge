import { useEffect } from "react";
import type { AppConfig } from "../../shared/types";
import { ActionEditorModal } from "./custom-actions/components/ActionEditorModal";
import { CustomActionsList } from "./custom-actions/components/CustomActionsList";
import { RunActionModal } from "./custom-actions/components/RunActionModal";
import { useActionEditor } from "./custom-actions/hooks/useActionEditor";
import { useActionRows } from "./custom-actions/hooks/useActionRows";
import { useRunActionModal } from "./custom-actions/hooks/useRunActionModal";

interface Props {
  config: AppConfig;
  onSave: (nextConfig: AppConfig) => Promise<void>;
  createRequestToken?: number;
  onCreateRequestConsumed?: () => void;
}

export function CustomActionsTab({
  config,
  onSave,
  createRequestToken = 0,
  onCreateRequestConsumed,
}: Props): JSX.Element {
  const rows = useActionRows({ config, onSave });
  const editor = useActionEditor({ config, onSave });
  const runModal = useRunActionModal();

  useEffect(() => {
    if (createRequestToken <= 0) {
      return;
    }
    editor.openCreateEditor();
    onCreateRequestConsumed?.();
  }, [createRequestToken, onCreateRequestConsumed]);

  return (
    <section className="dashed-section">
      <CustomActionsList
        actionNames={rows.actionNames}
        aliasDraftByActionName={rows.aliasDraftByActionName}
        config={config}
        deleteAction={rows.deleteAction}
        onEditAction={editor.openEditEditor}
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
          addStepAtIndex={editor.addStepAtIndex}
          changeSelectedStepAction={editor.changeSelectedStepAction}
          closeEditorModal={editor.closeEditorModal}
          contextVariables={editor.contextVariables}
          contextWarnings={editor.contextWarnings}
          deleteSelectedStep={editor.deleteSelectedStep}
          editorDraft={editor.editorDraft}
          editorErrorMessage={editor.editorErrorMessage}
          editorMode={editor.editorMode}
          editorSaveButtonLabel={editor.editorSaveButtonLabel}
          editorSaveStatus={editor.editorSaveStatus}
          edges={editor.edges}
          isSavingEditor={editor.isSavingEditor}
          jsonDraftByFieldId={editor.jsonDraftByFieldId}
          jsonErrorByFieldId={editor.jsonErrorByFieldId}
          nodes={editor.nodes}
          persistEditorDraft={editor.persistEditorDraft}
          selectedStep={editor.selectedStep}
          selectedStepIndex={editor.selectedStepIndex}
          setJsonDraftByFieldId={editor.setJsonDraftByFieldId}
          setJsonErrorByFieldId={editor.setJsonErrorByFieldId}
          setSelectedStepIndex={editor.setSelectedStepIndex}
          updateActionName={editor.updateActionName}
          updateSelectedStep={editor.updateSelectedStep}
        />
      ) : null}

      {runModal.runActionName ? (
        <RunActionModal
          closeRunModal={runModal.closeRunModal}
          isRunningAction={runModal.isRunningAction}
          runAction={runModal.runAction}
          runActionMessage={runModal.runActionMessage}
          runActionName={runModal.runActionName}
          runArgsDraft={runModal.runArgsDraft}
          setRunArgsDraft={runModal.setRunArgsDraft}
        />
      ) : null}
    </section>
  );
}
