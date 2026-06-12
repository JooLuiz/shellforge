import { useCallback, useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import type { Node, ReactFlowInstance } from "reactflow";
import type { ActionStep } from "../../../../shared/types";
import type {
  BlockGroupNodeData,
  InsertFlowNodeData,
  InsertionPoint,
  StepFlowNodeData,
  StepPath,
} from "../types";
import {
  FLOW_FOCUS_ZOOM,
  focusDefaultFlowViewport,
  focusFlowOnNode,
} from "../utils/flowViewportFocus";
import { resolveBlockScopeEntryPath } from "../utils/flowScope";
import { attachShiftScrollPan } from "../utils/flowShiftScrollPan";
import { stepPathToKey } from "../utils/stepPath";

const SINGLE_CLICK_FOCUS_DELAY_MS = 250;

function isStepFlowNodeData(data: unknown): data is StepFlowNodeData {
  return (
    typeof data === "object" &&
    data !== null &&
    "stepPath" in data &&
    Array.isArray((data as StepFlowNodeData).stepPath)
  );
}

function isInsertFlowNodeData(data: unknown): data is InsertFlowNodeData {
  return (
    typeof data === "object" &&
    data !== null &&
    "insertionPoint" in data &&
    typeof (data as InsertFlowNodeData).insertionPoint === "object"
  );
}

function isBlockGroupNodeData(data: unknown): data is BlockGroupNodeData {
  return (
    typeof data === "object" &&
    data !== null &&
    "stepPath" in data &&
    "actionKey" in data &&
    typeof (data as BlockGroupNodeData).actionKey === "string" &&
    Array.isArray((data as BlockGroupNodeData).stepPath)
  );
}

function readStepPathFromNode(node: Node): StepPath | null {
  if (isBlockGroupNodeData(node.data)) {
    return node.data.stepPath;
  }

  if (isStepFlowNodeData(node.data)) {
    return node.data.stepPath;
  }

  return null;
}

interface UseFlowEditorViewportInput {
  addStepAtInsertionPoint: (insertionPoint: InsertionPoint) => void;
  enterBlockScope: (blockStepPath: StepPath) => void;
  flowCanvasRef: React.RefObject<HTMLDivElement>;
  flowContainerPath: StepPath;
  nodes: Node[];
  rootSteps: ActionStep[];
  setSelectedStepPath: (nextPath: StepPath | null) => void;
}

interface UseFlowEditorViewportResult {
  defaultViewport: { x: number; y: number; zoom: number };
  handleNodeClick: (event: MouseEvent, node: Node) => void;
  handleNodeDoubleClick: (event: MouseEvent, node: Node) => void;
  handleReactFlowInit: (reactFlowInstance: ReactFlowInstance) => void;
}

export function useFlowEditorViewport({
  addStepAtInsertionPoint,
  enterBlockScope,
  flowCanvasRef,
  flowContainerPath,
  nodes,
  rootSteps,
  setSelectedStepPath,
}: UseFlowEditorViewportInput): UseFlowEditorViewportResult {
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);
  const detachShiftScrollPanRef = useRef<(() => void) | null>(null);
  const pendingFocusTimerRef = useRef<number | null>(null);
  const lastFocusedScopeKeyRef = useRef<string | null>(null);
  const flowContainerPathKey = stepPathToKey(flowContainerPath);

  const focusDefaultViewportIfNeeded = useCallback((): void => {
    const reactFlowInstance = reactFlowInstanceRef.current;
    if (!reactFlowInstance || nodes.length === 0) {
      return;
    }

    if (lastFocusedScopeKeyRef.current === flowContainerPathKey) {
      return;
    }

    lastFocusedScopeKeyRef.current = flowContainerPathKey;
    focusDefaultFlowViewport(
      reactFlowInstance,
      nodes,
      rootSteps,
      flowContainerPath,
      FLOW_FOCUS_ZOOM,
    );
  }, [flowContainerPath, flowContainerPathKey, nodes, rootSteps]);

  const clearPendingFocusTimer = (): void => {
    if (pendingFocusTimerRef.current !== null) {
      window.clearTimeout(pendingFocusTimerRef.current);
      pendingFocusTimerRef.current = null;
    }
  };

  const scheduleNodeFocus = (targetNode: Node): void => {
    clearPendingFocusTimer();
    pendingFocusTimerRef.current = window.setTimeout(() => {
      const reactFlowInstance = reactFlowInstanceRef.current;
      if (!reactFlowInstance) {
        return;
      }

      focusFlowOnNode(reactFlowInstance, targetNode, FLOW_FOCUS_ZOOM);
      pendingFocusTimerRef.current = null;
    }, SINGLE_CLICK_FOCUS_DELAY_MS);
  };

  const handleReactFlowInit = useCallback(
    (reactFlowInstance: ReactFlowInstance): void => {
      reactFlowInstanceRef.current = reactFlowInstance;
      detachShiftScrollPanRef.current?.();

      const paneElement =
        flowCanvasRef.current?.querySelector(".react-flow__pane") ??
        flowCanvasRef.current?.querySelector(".react-flow__viewport");

      if (paneElement) {
        detachShiftScrollPanRef.current = attachShiftScrollPan(reactFlowInstance, paneElement);
      }

      focusDefaultViewportIfNeeded();
    },
    [flowCanvasRef, focusDefaultViewportIfNeeded],
  );

  useEffect(() => {
    return () => {
      clearPendingFocusTimer();
      detachShiftScrollPanRef.current?.();
    };
  }, []);

  useEffect(() => {
    focusDefaultViewportIfNeeded();
  }, [focusDefaultViewportIfNeeded, flowContainerPathKey]);

  const handleNodeClick = useCallback(
    (_event: MouseEvent, node: Node): void => {
      if (isInsertFlowNodeData(node.data)) {
        clearPendingFocusTimer();
        addStepAtInsertionPoint(node.data.insertionPoint);
        return;
      }

      const stepPath = readStepPathFromNode(node);
      if (!stepPath) {
        return;
      }

      setSelectedStepPath(stepPath);
      scheduleNodeFocus(node);
    },
    [addStepAtInsertionPoint, setSelectedStepPath],
  );

  const handleNodeDoubleClick = useCallback(
    (_event: MouseEvent, node: Node): void => {
      clearPendingFocusTimer();

      const stepPath = readStepPathFromNode(node);
      if (!stepPath) {
        return;
      }

      const blockScopePath = resolveBlockScopeEntryPath(rootSteps, stepPath);
      if (!blockScopePath) {
        return;
      }

      enterBlockScope(blockScopePath);
    },
    [enterBlockScope, rootSteps],
  );

  return {
    defaultViewport: { x: 0, y: 0, zoom: FLOW_FOCUS_ZOOM },
    handleNodeClick,
    handleNodeDoubleClick,
    handleReactFlowInit,
  };
}
