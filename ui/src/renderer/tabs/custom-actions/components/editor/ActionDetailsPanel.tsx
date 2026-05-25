import type { Dispatch, SetStateAction } from "react";
import type { ActionStep } from "../../../../../shared/types";
import { StepFieldsEditor } from "./StepFieldsEditor";

interface ActionDetailsPanelProps {
  changeSelectedStepAction: (nextActionType: string) => void;
  contextVariables: string[];
  deleteSelectedStep: () => void;
  jsonDraftByFieldId: Record<string, string>;
  jsonErrorByFieldId: Record<string, string>;
  selectedStep: ActionStep | null;
  selectedStepIndex: number | null;
  setJsonDraftByFieldId: Dispatch<SetStateAction<Record<string, string>>>;
  setJsonErrorByFieldId: Dispatch<SetStateAction<Record<string, string>>>;
  updateActionName: (nextActionName: string) => void;
  updateSelectedStep: (updater: (step: ActionStep) => ActionStep) => void;
  value: string;
}

export function ActionDetailsPanel({
  changeSelectedStepAction,
  contextVariables,
  deleteSelectedStep,
  jsonDraftByFieldId,
  jsonErrorByFieldId,
  selectedStep,
  selectedStepIndex,
  setJsonDraftByFieldId,
  setJsonErrorByFieldId,
  updateActionName,
  updateSelectedStep,
  value,
}: ActionDetailsPanelProps): JSX.Element {
  const hasSelectedStep = selectedStep !== null;

  return (
    <aside className="details-panel">
      <div className="details-panel-header">
        <h4 className="details-panel-title">Action Details</h4>
        <label className="field-block">
          Action name
          <input value={value} onChange={(event) => updateActionName(event.target.value)} />
        </label>

        <p className="status-text">
          Select the step type above, then click a <strong>+</strong> node in the flow to
          insert it.
        </p>
      </div>

      <section className="step-details-section">
        <h4 className="details-panel-title step-details-title">Step Details</h4>
        {!hasSelectedStep ? (
          <p className="status-text step-details-empty">
            Select a step node to edit fields.
          </p>
        ) : null}
        {hasSelectedStep ? (
          <>
            <div className="step-fields-scroll">
              <StepFieldsEditor
                changeSelectedStepAction={changeSelectedStepAction}
                contextVariables={contextVariables}
                jsonDraftByFieldId={jsonDraftByFieldId}
                jsonErrorByFieldId={jsonErrorByFieldId}
                selectedStep={selectedStep}
                selectedStepIndex={selectedStepIndex}
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
