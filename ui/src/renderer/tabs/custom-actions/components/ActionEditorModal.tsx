import ReactFlow, {
  Background,
  Controls,
} from "reactflow";
import { useRef } from "react";
import type { ActionEditorDraft } from "../types";
import { ModalCloseButton } from "../../../components/ModalCloseButton";
import { useModalDismiss } from "../../../hooks/useModalDismiss";
import { useActionEditorContext } from "../context/ActionEditorContext";
import { useFlowEditorViewport } from "../hooks/useFlowEditorViewport";
import { getActionSteps } from "../utils/stepUtils";
import { customActionFlowNodeTypes } from "./flow/CustomActionFlowNodes";
import { FlowScopeBreadcrumb } from "./flow/FlowScopeBreadcrumb";
import { FlowValidationBanner } from "./flow/FlowValidationBanner";
import { ActionEditorToolbar } from "./editor/ActionEditorToolbar";
import { StepDetailsPanel } from "./editor/StepDetailsPanel";

const FLOW_MIN_ZOOM = 0.2;
const FLOW_MAX_ZOOM = 2;

function readBrowserProfileValue(editorDraft: ActionEditorDraft): string {
  const browserProfile = editorDraft.actionConfig.browserProfile;
  return typeof browserProfile === "string" ? browserProfile : "";
}

export function ActionEditorModal(): JSX.Element {
  const { editor } = useActionEditorContext();
  const {
    addStepAtInsertionPoint,
    closeEditorModal,
    draftFieldValidationState,
    editorDraft,
    editorMode,
    editorSaveButtonLabel,
    editorSaveStatus,
    edges,
    enterBlockScope,
    flowBreadcrumbSegments,
    flowContainerPath,
    flowValidationBannerItems,
    hasBrowserSteps,
    isSavingEditor,
    nodes,
    persistEditorDraft,
    setFlowContainerPath,
    setSelectedStepPath,
    updateActionName,
    updateBrowserProfile,
  } = editor;

  if (!editorDraft || !editorMode) {
    throw new Error("ActionEditorModal requires an active editor draft and mode");
  }

  const flowCanvasRef = useRef<HTMLDivElement>(null);
  const rootSteps = getActionSteps(editorDraft.actionConfig);

  const { backdropProps, panelProps } = useModalDismiss(closeEditorModal);

  const {
    defaultViewport,
    handleNodeClick,
    handleNodeDoubleClick,
    handleReactFlowInit,
  } = useFlowEditorViewport({
    addStepAtInsertionPoint,
    enterBlockScope,
    flowCanvasRef,
    flowContainerPath,
    nodes,
    rootSteps,
    setSelectedStepPath,
  });

  return (
    <div className="modal-backdrop" {...backdropProps}>
      <div className="modal" {...panelProps}>
        <header className="modal-header">
          <h3>{editorMode === "edit" ? "Edit Custom Action" : "New Custom Action"}</h3>
          <ModalCloseButton onClick={closeEditorModal} />
        </header>
        <div className="modal-body">
          <ActionEditorToolbar
            actionName={editorDraft.actionName}
            browserProfile={readBrowserProfileValue(editorDraft)}
            draftFieldValidationState={draftFieldValidationState}
            editorMode={editorMode}
            hasBrowserSteps={hasBrowserSteps}
            updateActionName={updateActionName}
            updateBrowserProfile={updateBrowserProfile}
          />

          <div className="canvas-and-details">
            <div className="flow-canvas" ref={flowCanvasRef}>
              <FlowScopeBreadcrumb
                segments={flowBreadcrumbSegments}
                onNavigate={setFlowContainerPath}
              />
              <FlowValidationBanner items={flowValidationBannerItems} />
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={customActionFlowNodeTypes}
                defaultViewport={defaultViewport}
                minZoom={FLOW_MIN_ZOOM}
                maxZoom={FLOW_MAX_ZOOM}
                zoomOnDoubleClick={false}
                selectionKeyCode="Control"
                onInit={handleReactFlowInit}
                onNodeClick={handleNodeClick}
                onNodeDoubleClick={handleNodeDoubleClick}
                onPaneClick={() => setSelectedStepPath(null)}
              >
                <Background />
                <Controls />
              </ReactFlow>
              <p className="flow-canvas-hint">Shift + scroll to pan vertically.</p>
            </div>

            <StepDetailsPanel />
          </div>

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
