import type { Edge, Node } from "reactflow";
import type { ActionStep } from "../../../../shared/types";
import type {
  InsertFlowNodeData,
  StepFlowNodeData,
} from "../components/flow/CustomActionFlowNodes";
import { summarizeStep } from "./stepUtils";

const FLOW_TOP_PADDING = 40;
const FLOW_VERTICAL_PITCH = 200;
const FLOW_CENTER_LINE_X = 196;
const STEP_NODE_WIDTH = 280;
const STEP_NODE_HEIGHT = 72;
const INSERT_NODE_SIZE = 42;
const STEP_NODE_X = FLOW_CENTER_LINE_X - STEP_NODE_WIDTH / 2;
const INSERT_NODE_X = FLOW_CENTER_LINE_X - INSERT_NODE_SIZE / 2;

export const FLOW_LAYOUT_METRICS = {
  stepNodeWidth: STEP_NODE_WIDTH,
  stepNodeHeight: STEP_NODE_HEIGHT,
  insertNodeSize: INSERT_NODE_SIZE,
  centerLineX: FLOW_CENTER_LINE_X,
} as const;

const STEP_NODE_WRAPPER_STYLE = {
  width: STEP_NODE_WIDTH,
  minWidth: STEP_NODE_WIDTH,
  maxWidth: STEP_NODE_WIDTH,
  height: STEP_NODE_HEIGHT,
  minHeight: STEP_NODE_HEIGHT,
  maxHeight: STEP_NODE_HEIGHT,
} as const;

const INSERT_NODE_WRAPPER_STYLE = {
  width: INSERT_NODE_SIZE,
  minWidth: INSERT_NODE_SIZE,
  maxWidth: INSERT_NODE_SIZE,
  height: INSERT_NODE_SIZE,
  minHeight: INSERT_NODE_SIZE,
  maxHeight: INSERT_NODE_SIZE,
} as const;

function getInsertNodeY(insertionIndex: number): number {
  const insertCenterY = FLOW_TOP_PADDING + insertionIndex * FLOW_VERTICAL_PITCH;
  return insertCenterY - INSERT_NODE_SIZE / 2;
}

function getStepNodeY(stepIndex: number): number {
  const insertionCenterY = FLOW_TOP_PADDING + stepIndex * FLOW_VERTICAL_PITCH;
  const stepCenterY = insertionCenterY + FLOW_VERTICAL_PITCH / 2;
  return stepCenterY - STEP_NODE_HEIGHT / 2;
}

export function buildFlowNodesAndEdges(steps: ActionStep[]): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node<StepFlowNodeData | InsertFlowNodeData>[] = [];
  const edges: Edge[] = [];

  for (
    let insertionIndex = 0;
    insertionIndex <= steps.length;
    insertionIndex += 1
  ) {
    const insertionNodeId = `insert-${insertionIndex}`;
    nodes.push({
      id: insertionNodeId,
      type: "insertNode",
      position: { x: INSERT_NODE_X, y: getInsertNodeY(insertionIndex) },
      width: INSERT_NODE_SIZE,
      height: INSERT_NODE_SIZE,
      style: INSERT_NODE_WRAPPER_STYLE,
      data: {
        ariaLabel: `Insert step at position ${insertionIndex + 1}`,
      },
      draggable: false,
    });

    if (insertionIndex >= steps.length) {
      continue;
    }

    const step = steps[insertionIndex];
    const stepNodeId = `step-${insertionIndex}`;
    nodes.push({
      id: stepNodeId,
      type: "stepNode",
      position: { x: STEP_NODE_X, y: getStepNodeY(insertionIndex) },
      width: STEP_NODE_WIDTH,
      height: STEP_NODE_HEIGHT,
      style: STEP_NODE_WRAPPER_STYLE,
      data: {
        title: `Step ${insertionIndex + 1}: ${step.action}`,
        summary: summarizeStep(step),
      },
      draggable: false,
    });

    edges.push({
      id: `${insertionNodeId}-${stepNodeId}`,
      type: "straight",
      source: insertionNodeId,
      target: stepNodeId,
      style: { stroke: "#94aec6" },
    });

    const nextInsertionNodeId = `insert-${insertionIndex + 1}`;
    edges.push({
      id: `${stepNodeId}-${nextInsertionNodeId}`,
      type: "straight",
      source: stepNodeId,
      target: nextInsertionNodeId,
      style: { stroke: "#94aec6" },
    });
  }

  return { nodes, edges };
}
