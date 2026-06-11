import type { Node, ReactFlowInstance } from "reactflow";
import type { ActionStep } from "../../../../shared/types";
import type { BlockGroupNodeData, StepFlowNodeData, StepPath } from "../types";
import { FLOW_LAYOUT_METRICS } from "./flow";
import {
  FOREACH_LANE_KEY,
  IFELSE_LANE_KEYS,
  TRYCATCH_LANE_KEYS,
} from "./flowLayout";
import { resolveFlowContainerStep } from "./flowScope";
import { stepPathToKey } from "./stepPath";

export const FLOW_FOCUS_ZOOM = 1.15;
export const FLOW_FOCUS_ANIMATION_MS = 300;

function getSubSteps(step: ActionStep, arrayKey: string): ActionStep[] {
  const value = step[arrayKey];
  return Array.isArray(value) ? (value as ActionStep[]) : [];
}

function readNodeStepPath(node: Node): StepPath | null {
  const nodeData = node.data;
  if (
    typeof nodeData !== "object" ||
    nodeData === null ||
    !("stepPath" in nodeData) ||
    !Array.isArray((nodeData as StepFlowNodeData).stepPath)
  ) {
    return null;
  }

  return (nodeData as StepFlowNodeData | BlockGroupNodeData).stepPath;
}

function getFirstLaneStepPath(
  containerPath: StepPath,
  laneKeys: readonly string[],
  containerStep: ActionStep,
): StepPath | null {
  for (const laneKey of laneKeys) {
    const laneSteps = getSubSteps(containerStep, laneKey);
    if (laneSteps.length > 0) {
      return [...containerPath, { arrayKey: laneKey, stepIndex: 0 }];
    }
  }

  return null;
}

export function getDefaultFocusStepPath(
  rootSteps: ActionStep[],
  containerPath: StepPath,
): StepPath | null {
  if (containerPath.length === 0) {
    if (rootSteps.length === 0) {
      return null;
    }

    return [{ arrayKey: "steps", stepIndex: 0 }];
  }

  const containerStep = resolveFlowContainerStep(rootSteps, containerPath);
  if (!containerStep) {
    return null;
  }

  if (containerStep.action === "tryCatch") {
    return getFirstLaneStepPath(containerPath, TRYCATCH_LANE_KEYS, containerStep);
  }

  if (containerStep.action === "ifElse") {
    return getFirstLaneStepPath(containerPath, IFELSE_LANE_KEYS, containerStep);
  }

  const innerSteps = getSubSteps(containerStep, FOREACH_LANE_KEY);
  if (innerSteps.length === 0) {
    return null;
  }

  return [...containerPath, { arrayKey: FOREACH_LANE_KEY, stepIndex: 0 }];
}

export function getDefaultFocusInsertNodeId(containerPath: StepPath): string {
  const scopeKey = stepPathToKey(containerPath);
  const nodeIdPrefix = containerPath.length === 0 ? "root" : `scope-${scopeKey}`;
  return `${nodeIdPrefix}__insert-0`;
}

export function findFlowNodeForStepPath(nodes: Node[], stepPath: StepPath): Node | null {
  const targetKey = stepPathToKey(stepPath);

  const blockGroupMatch = nodes.find((node) => {
    if (node.type !== "blockGroupNode") {
      return false;
    }

    const nodeStepPath = readNodeStepPath(node);
    return nodeStepPath !== null && stepPathToKey(nodeStepPath) === targetKey;
  });

  if (blockGroupMatch) {
    return blockGroupMatch;
  }

  return (
    nodes.find((node) => {
      const nodeStepPath = readNodeStepPath(node);
      return nodeStepPath !== null && stepPathToKey(nodeStepPath) === targetKey;
    }) ?? null
  );
}

export function findFlowNodeById(nodes: Node[], nodeId: string): Node | null {
  return nodes.find((node) => node.id === nodeId) ?? null;
}

export function focusFlowOnNode(
  reactFlowInstance: ReactFlowInstance,
  targetNode: Node,
  zoom: number = FLOW_FOCUS_ZOOM,
): void {
  const nodePosition = targetNode.positionAbsolute ?? targetNode.position;
  const nodeWidth = targetNode.width ?? FLOW_LAYOUT_METRICS.stepNodeWidth;
  const nodeHeight = targetNode.height ?? FLOW_LAYOUT_METRICS.stepNodeHeight;
  const nodeCenterX = nodePosition.x + nodeWidth / 2;
  const nodeCenterY = nodePosition.y + nodeHeight / 2;

  void reactFlowInstance.setCenter(nodeCenterX, nodeCenterY, {
    zoom,
    duration: FLOW_FOCUS_ANIMATION_MS,
  });
}

export function focusFlowOnStepPath(
  reactFlowInstance: ReactFlowInstance,
  nodes: Node[],
  stepPath: StepPath,
  zoom: number = FLOW_FOCUS_ZOOM,
): boolean {
  const targetNode = findFlowNodeForStepPath(nodes, stepPath);
  if (!targetNode) {
    return false;
  }

  focusFlowOnNode(reactFlowInstance, targetNode, zoom);
  return true;
}

export function focusDefaultFlowViewport(
  reactFlowInstance: ReactFlowInstance,
  nodes: Node[],
  rootSteps: ActionStep[],
  containerPath: StepPath,
  zoom: number = FLOW_FOCUS_ZOOM,
): void {
  const defaultStepPath = getDefaultFocusStepPath(rootSteps, containerPath);
  if (defaultStepPath && focusFlowOnStepPath(reactFlowInstance, nodes, defaultStepPath, zoom)) {
    return;
  }

  const insertNodeId = getDefaultFocusInsertNodeId(containerPath);
  const insertNode = findFlowNodeById(nodes, insertNodeId);
  if (insertNode) {
    focusFlowOnNode(reactFlowInstance, insertNode, zoom);
  }
}
