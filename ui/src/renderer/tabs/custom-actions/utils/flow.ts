import type { Edge, Node } from "reactflow";
import type { ActionStep } from "../../../../shared/types";
import type { StepPath } from "../types";
import { buildBlockGroupContent } from "./buildBlockFlow";
import { buildStepListFlow } from "./buildStepListFlow";
import type { FlowValidationSeverity } from "./flowValidationUtils";
import {
  FLOW_TOP_PADDING,
  FOREACH_LANE_KEY,
  INSERT_NODE_SIZE,
  STEP_NODE_HEIGHT,
  STEP_NODE_WIDTH,
  computeBlockGroupHeight,
  computeBlockGroupWidth,
} from "./flowLayout";
import { resolveFlowContainerStep } from "./flowScope";
import { stepPathToKey } from "./stepPath";

export const FLOW_LAYOUT_METRICS = {
  stepNodeWidth: STEP_NODE_WIDTH,
  stepNodeHeight: STEP_NODE_HEIGHT,
  insertNodeSize: INSERT_NODE_SIZE,
} as const;

type StepValidationSeverityMap = Map<string, FlowValidationSeverity>;

function buildMultiLaneBlockScopeFlow(
  blockStep: ActionStep,
  containerPath: StepPath,
  stepValidationSeverityByKey: StepValidationSeverityMap,
): { nodes: Node[]; edges: Edge[] } {
  const scopeKey = stepPathToKey(containerPath);
  const groupNodeId = `scope-${scopeKey}`;
  const groupWidth = computeBlockGroupWidth(blockStep);
  const groupHeight = computeBlockGroupHeight(blockStep);
  const groupX = STEP_NODE_WIDTH / 2 - groupWidth / 2;

  const { groupNode, childNodes, childEdges } = buildBlockGroupContent(
    blockStep,
    groupNodeId,
    groupWidth,
    groupHeight,
    containerPath,
    stepValidationSeverityByKey,
  );

  groupNode.position = { x: groupX, y: FLOW_TOP_PADDING };
  groupNode.zIndex = -1;

  return {
    nodes: [groupNode, ...childNodes],
    edges: childEdges,
  };
}

function buildSingleLaneBlockScopeFlow(
  blockStep: ActionStep,
  containerPath: StepPath,
  stepValidationSeverityByKey: StepValidationSeverityMap,
): { nodes: Node[]; edges: Edge[] } {
  const innerSteps = Array.isArray(blockStep[FOREACH_LANE_KEY])
    ? (blockStep[FOREACH_LANE_KEY] as ActionStep[])
    : [];

  return buildStepListFlow({
    steps: innerSteps,
    parentPath: containerPath,
    arrayKey: FOREACH_LANE_KEY,
    nodeIdPrefix: `scope-${stepPathToKey(containerPath)}`,
    stepValidationSeverityByKey,
  });
}

/**
 * Builds ReactFlow nodes and edges for the current editor scope.
 * Root scope renders top-level action steps; nested scope renders one block interior.
 */
export function buildFlowNodesAndEdges(
  rootSteps: ActionStep[],
  containerPath: StepPath = [],
  stepValidationSeverityByKey: StepValidationSeverityMap = new Map(),
): {
  nodes: Node[];
  edges: Edge[];
} {
  if (containerPath.length === 0) {
    return buildStepListFlow({
      steps: rootSteps,
      parentPath: [],
      arrayKey: "steps",
      nodeIdPrefix: "root",
      stepValidationSeverityByKey,
    });
  }

  const containerStep = resolveFlowContainerStep(rootSteps, containerPath);
  if (!containerStep) {
    return buildStepListFlow({
      steps: rootSteps,
      parentPath: [],
      arrayKey: "steps",
      nodeIdPrefix: "root",
      stepValidationSeverityByKey,
    });
  }

  if (containerStep.action === "tryCatch" || containerStep.action === "ifElse") {
    return buildMultiLaneBlockScopeFlow(
      containerStep,
      containerPath,
      stepValidationSeverityByKey,
    );
  }

  return buildSingleLaneBlockScopeFlow(
    containerStep,
    containerPath,
    stepValidationSeverityByKey,
  );
}
