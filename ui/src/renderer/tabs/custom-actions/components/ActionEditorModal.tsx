import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "reactflow";
import { useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ActionStep } from "../../../../shared/types";
import type { EditSaveStatus, EditorMode, StepUpdater } from "../types";
import { FLOW_LAYOUT_METRICS } from "../utils/flow";
import { customActionFlowNodeTypes } from "./flow/CustomActionFlowNodes";
import { ActionDetailsPanel } from "./editor/ActionDetailsPanel";

const FLOW_MIN_ZOOM = 0.2;
const FLOW_MAX_ZOOM = 2;
const FLOW_INITIAL_FIT_MAX_ZOOM = 1;
const FLOW_FIT_PADDING = 0.25;
const FLOW_FOCUS_ZOOM = 1.15;
const FLOW_FOCUS_ANIMATION_MS = 300;

interface ActionEditorModalProps {
  addStepAtIndex: (insertionIndex: number) => void;
  changeSelectedStepAction: (nextActionType: string) => void;
  closeEditorModal: () => void;
  contextVariables: string[];
  contextWarnings: Array<{
    fieldPath: string;
    stepIndex: number;
    variableName: string;
  }>;
  deleteSelectedStep: () => void;
  editorDraft: { actionName: string };
  editorErrorMessage: string | null;
  editorMode: Exclude<EditorMode, null>;
  editorSaveButtonLabel: string;
  editorSaveStatus: EditSaveStatus;
  edges: Edge[];
  isSavingEditor: boolean;
  jsonDraftByFieldId: Record<string, string>;
  jsonErrorByFieldId: Record<string, string>;
  nodes: Node[];
  persistEditorDraft: () => Promise<void>;
  selectedStep: ActionStep | null;
  selectedStepIndex: number | null;
  setJsonDraftByFieldId: Dispatch<SetStateAction<Record<string, string>>>;
  setJsonErrorByFieldId: Dispatch<SetStateAction<Record<string, string>>>;
  setSelectedStepIndex: (nextIndex: number | null) => void;
  updateActionName: (nextActionName: string) => void;
  updateSelectedStep: (updater: StepUpdater) => void;
}

export function ActionEditorModal({
  addStepAtIndex,
  changeSelectedStepAction,
  closeEditorModal,
  contextVariables,
  contextWarnings,
  deleteSelectedStep,
  editorDraft,
  editorErrorMessage,
  editorMode,
  editorSaveButtonLabel,
  editorSaveStatus,
  edges,
  isSavingEditor,
  jsonDraftByFieldId,
  jsonErrorByFieldId,
  nodes,
  persistEditorDraft,
  selectedStep,
  selectedStepIndex,
  setJsonDraftByFieldId,
  setJsonErrorByFieldId,
  setSelectedStepIndex,
  updateActionName,
  updateSelectedStep,
}: ActionEditorModalProps): JSX.Element {
  const reactFlowInstanceRef = useRef<ReactFlowInstance<Node, Edge> | null>(null);

  const focusStepNode = (stepNode: Node): void => {
    const reactFlowInstance = reactFlowInstanceRef.current;
    if (!reactFlowInstance) {
      return;
    }

    const nodePosition = stepNode.positionAbsolute ?? stepNode.position;
    const nodeWidth = stepNode.width ?? FLOW_LAYOUT_METRICS.stepNodeWidth;
    const nodeHeight = stepNode.height ?? FLOW_LAYOUT_METRICS.stepNodeHeight;
    const nodeCenterX = nodePosition.x + nodeWidth / 2;
    const nodeCenterY = nodePosition.y + nodeHeight / 2;

    void reactFlowInstance.setCenter(nodeCenterX, nodeCenterY, {
      zoom: FLOW_FOCUS_ZOOM,
      duration: FLOW_FOCUS_ANIMATION_MS,
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header className="modal-header">
          <h3>{editorMode === "edit" ? "Edit Custom Action" : "New Custom Action"}</h3>
          <button
            type="button"
            className="modal-close"
            onClick={closeEditorModal}
            aria-label="Close modal"
          >
            X
          </button>
        </header>
        <div className="modal-body">
          <div className="canvas-and-details">
            <div className="flow-canvas">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={customActionFlowNodeTypes}
                fitView
                minZoom={FLOW_MIN_ZOOM}
                maxZoom={FLOW_MAX_ZOOM}
                fitViewOptions={{
                  maxZoom: FLOW_INITIAL_FIT_MAX_ZOOM,
                  padding: FLOW_FIT_PADDING,
                }}
                onInit={(reactFlowInstance) => {
                  reactFlowInstanceRef.current = reactFlowInstance;
                }}
                onNodeClick={(_event, node) => {
                  if (node.id.startsWith("insert-")) {
                    const insertionIndex = Number(node.id.replace("insert-", ""));
                    if (!Number.isNaN(insertionIndex)) {
                      addStepAtIndex(insertionIndex);
                    }
                    return;
                  }
                  if (node.id.startsWith("step-")) {
                    const stepIndex = Number(node.id.replace("step-", ""));
                    if (!Number.isNaN(stepIndex)) {
                      setSelectedStepIndex(stepIndex);
                      focusStepNode(node);
                    }
                  }
                }}
              >
                <Background />
                <Controls />
              </ReactFlow>
            </div>

            <ActionDetailsPanel
              changeSelectedStepAction={changeSelectedStepAction}
              contextVariables={contextVariables}
              deleteSelectedStep={deleteSelectedStep}
              jsonDraftByFieldId={jsonDraftByFieldId}
              jsonErrorByFieldId={jsonErrorByFieldId}
              selectedStep={selectedStep}
              selectedStepIndex={selectedStepIndex}
              setJsonDraftByFieldId={setJsonDraftByFieldId}
              setJsonErrorByFieldId={setJsonErrorByFieldId}
              updateActionName={updateActionName}
              updateSelectedStep={updateSelectedStep}
              value={editorDraft.actionName}
            />
          </div>

          {contextWarnings.length > 0 ? (
            <div className="warning-box">
              <strong>Context validation warnings</strong>
              <ul>
                {contextWarnings.map((warning) => (
                  <li
                    key={`${warning.stepIndex}-${warning.fieldPath}-${warning.variableName}`}
                  >
                    step {warning.stepIndex + 1}, field "{warning.fieldPath}" references
                    missing variable "{warning.variableName}"
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {editorErrorMessage ? (
            <div className="error-banner">{editorErrorMessage}</div>
          ) : null}

          <div className="modal-actions">
            <button type="button" className="button button-red" onClick={closeEditorModal}>
              Cancel
            </button>
            <button
              type="button"
              className="button button-teal"
              onClick={() => void persistEditorDraft()}
              disabled={isSavingEditor || (editorMode === "edit" && editorSaveStatus === "saved")}
            >
              {editorSaveButtonLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
