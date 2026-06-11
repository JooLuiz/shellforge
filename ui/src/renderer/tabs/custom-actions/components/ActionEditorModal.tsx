import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
} from "reactflow";
import { useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ActionConfig, ActionStep } from "../../../../shared/types";
import type {
  ActionEditorDraft,
  EditSaveStatus,
  EditorMode,
  FlowBreadcrumbSegment,
  InsertionPoint,
  StepPath,
  StepUpdater,
} from "../types";
import { ModalCloseButton } from "../../../components/ModalCloseButton";
import { useModalDismiss } from "../../../hooks/useModalDismiss";
import { useFlowEditorViewport } from "../hooks/useFlowEditorViewport";
import { getActionSteps } from "../utils/stepUtils";
import type {
  DraftFieldValidationKey,
  FlowValidationBannerItem,
  FlowValidationSeverity,
} from "../utils/flowValidationUtils";
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

interface ActionEditorModalProps {
  actionRunner: Record<string, ActionConfig>;
  addStepAtInsertionPoint: (insertionPoint: InsertionPoint) => void;
  changeSelectedStepAction: (nextActionType: string) => void;
  closeEditorModal: () => void;
  configuredActionNames: string[];
  contextVariables: string[];
  deleteSelectedStep: () => void;
  draftFieldValidationState: Partial<Record<DraftFieldValidationKey, FlowValidationSeverity>>;
  editorDraft: ActionEditorDraft;
  editorMode: Exclude<EditorMode, null>;
  editorSaveButtonLabel: string;
  editorSaveStatus: EditSaveStatus;
  edges: Edge[];
  enterBlockScope: (blockStepPath: StepPath) => void;
  fieldValidationByKey: Map<string, FlowValidationSeverity>;
  flowBreadcrumbSegments: FlowBreadcrumbSegment[];
  flowContainerPath: StepPath;
  flowValidationBannerItems: FlowValidationBannerItem[];
  hasBrowserSteps: boolean;
  isSavingEditor: boolean;
  jsonDraftByFieldId: Record<string, string>;
  jsonErrorByFieldId: Record<string, string>;
  nodes: Node[];
  persistEditorDraft: () => Promise<void>;
  selectedStep: ActionStep | null;
  selectedStepPath: StepPath | null;
  selectedStepPathKey: string;
  setJsonDraftByFieldId: Dispatch<SetStateAction<Record<string, string>>>;
  setJsonErrorByFieldId: Dispatch<SetStateAction<Record<string, string>>>;
  setFlowContainerPath: (nextPath: StepPath) => void;
  setSelectedStepPath: (nextPath: StepPath | null) => void;
  updateActionName: (nextActionName: string) => void;
  updateBrowserProfile: (nextProfile: string) => void;
  updateSelectedStep: (updater: StepUpdater) => void;
}

export function ActionEditorModal({
  actionRunner,
  addStepAtInsertionPoint,
  changeSelectedStepAction,
  closeEditorModal,
  configuredActionNames,
  contextVariables,
  deleteSelectedStep,
  draftFieldValidationState,
  editorDraft,
  editorMode,
  editorSaveButtonLabel,
  editorSaveStatus,
  edges,
  enterBlockScope,
  fieldValidationByKey,
  flowBreadcrumbSegments,
  flowContainerPath,
  flowValidationBannerItems,
  hasBrowserSteps,
  isSavingEditor,
  jsonDraftByFieldId,
  jsonErrorByFieldId,
  nodes,
  persistEditorDraft,
  selectedStep,
  selectedStepPath,
  selectedStepPathKey,
  setJsonDraftByFieldId,
  setJsonErrorByFieldId,
  setFlowContainerPath,
  setSelectedStepPath,
  updateActionName,
  updateBrowserProfile,
  updateSelectedStep,
}: ActionEditorModalProps): JSX.Element {
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

            <StepDetailsPanel
              actionRunner={actionRunner}
              changeSelectedStepAction={changeSelectedStepAction}
              configuredActionNames={configuredActionNames}
              contextVariables={contextVariables}
              deleteSelectedStep={deleteSelectedStep}
              enterBlockScope={enterBlockScope}
              fieldValidationByKey={fieldValidationByKey}
              flowContainerPath={flowContainerPath}
              jsonDraftByFieldId={jsonDraftByFieldId}
              jsonErrorByFieldId={jsonErrorByFieldId}
              selectedStep={selectedStep}
              selectedStepPath={selectedStepPath}
              selectedStepPathKey={selectedStepPathKey}
              setJsonDraftByFieldId={setJsonDraftByFieldId}
              setJsonErrorByFieldId={setJsonErrorByFieldId}
              updateSelectedStep={updateSelectedStep}
            />
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
