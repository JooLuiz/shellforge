import { useActionEditorContext } from "../../context/ActionEditorContext";
import { isBlockStepAction } from "../../utils/flowScope";
import { stepPathToKey } from "../../utils/stepPath";
import { StepFieldsEditor } from "./StepFieldsEditor";

export function StepDetailsPanel(): JSX.Element {
  const { actionRunner, configuredActionNames, editor } = useActionEditorContext();
  const {
    changeSelectedStepAction,
    contextVariables,
    deleteSelectedStep,
    enterBlockScope,
    fieldValidationByKey,
    flowContainerPath,
    jsonDraftByFieldId,
    jsonErrorByFieldId,
    selectedStep,
    selectedStepPath,
    selectedStepPathKey,
    setJsonDraftByFieldId,
    setJsonErrorByFieldId,
    updateSelectedStep,
  } = editor;

  const hasSelectedStep = selectedStep !== null;
  const isInsideSelectedBlockScope =
    selectedStepPath !== null &&
    stepPathToKey(flowContainerPath) === stepPathToKey(selectedStepPath);
  const canOpenSelectedBlock =
    hasSelectedStep &&
    selectedStepPath !== null &&
    isBlockStepAction(selectedStep.action) &&
    !isInsideSelectedBlockScope;

  return (
    <aside className="details-panel">
      <section className="step-details-section">
        <h4 className="details-panel-title step-details-title">Step Details</h4>
        {!hasSelectedStep ? (
          <p className="status-text step-details-empty">
            Select a step node in the flow to edit its fields. Use <strong>+</strong> nodes to
            insert steps.
          </p>
        ) : null}
        {hasSelectedStep ? (
          <>
            {canOpenSelectedBlock ? (
              <div className="step-details-block-scope-actions">
                <p className="status-text step-details-block-scope-hint">
                  Double-click the block in the flow or click Open block to edit inner steps.
                </p>
                <button
                  type="button"
                  className="button button-teal step-details-open-block"
                  onClick={() => enterBlockScope(selectedStepPath)}
                >
                  Open block
                </button>
              </div>
            ) : null}
            <div className="step-fields-scroll">
              <StepFieldsEditor
                actionRunner={actionRunner}
                changeSelectedStepAction={changeSelectedStepAction}
                configuredActionNames={configuredActionNames}
                contextVariables={contextVariables}
                fieldValidationByKey={fieldValidationByKey}
                jsonDraftByFieldId={jsonDraftByFieldId}
                jsonErrorByFieldId={jsonErrorByFieldId}
                selectedStep={selectedStep}
                selectedStepPathKey={selectedStepPathKey}
                setJsonDraftByFieldId={setJsonDraftByFieldId}
                setJsonErrorByFieldId={setJsonErrorByFieldId}
                updateSelectedStep={updateSelectedStep}
              />
            </div>

            <div className="step-details-footer">
              <button
                type="button"
                className="button button-red"
                onClick={deleteSelectedStep}
              >
                Delete step
              </button>
            </div>
          </>
        ) : null}
      </section>
    </aside>
  );
}
