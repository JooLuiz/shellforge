import type { Edge, Node } from "reactflow";
import type { ActionStep } from "../../../../shared/types";
import type { InsertFlowNodeData, StepFlowNodeData, StepPath } from "../types";
import { buildBlockGroupContent } from "./buildBlockFlow";
import { formatActionTypeLabel } from "./formatActionTypeLabel";
import {
  BLOCK_STEP_ACTIONS,
  FLOW_TOP_PADDING,
  INSERT_NODE_SIZE,
  OUTER_STEP_GAP,
  STEP_NODE_HEIGHT,
  STEP_NODE_WIDTH,
  computeBlockGroupHeight,
  computeBlockGroupWidth,
} from "./flowLayout";
import { summarizeStep } from "./stepUtils";
import {
  lookupValidationSeverity,
  type FlowValidationSeverity,
} from "./flowValidationUtils";
import { getThemeCssVariable } from "../../../utils/themeColors";

function getFlowEdgeStyle(): { stroke: string } {
  const strokeColor = getThemeCssVariable("--color-flow-edge");
  return { stroke: strokeColor.length > 0 ? strokeColor : "#94aec6" };
}
const INSERT_NODE_X = STEP_NODE_WIDTH / 2 - INSERT_NODE_SIZE / 2;

type StepValidationSeverityMap = Map<string, FlowValidationSeverity>;

interface BuildStepListFlowInput {
  steps: ActionStep[];
  parentPath: StepPath;
  arrayKey: string;
  nodeIdPrefix: string;
  stepValidationSeverityByKey: StepValidationSeverityMap;
}

export function buildStepListFlow({
  steps,
  parentPath,
  arrayKey,
  nodeIdPrefix,
  stepValidationSeverityByKey,
}: BuildStepListFlowInput): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  let currentY = FLOW_TOP_PADDING;

  for (let stepIndex = 0; stepIndex <= steps.length; stepIndex += 1) {
    const insertNodeId = `${nodeIdPrefix}__insert-${stepIndex}`;
    const insertionPoint = {
      parentPath,
      arrayKey,
      insertionIndex: stepIndex,
    };

    nodes.push({
      id: insertNodeId,
      type: "insertNode",
      position: { x: INSERT_NODE_X, y: currentY },
      width: INSERT_NODE_SIZE,
      height: INSERT_NODE_SIZE,
      style: { width: INSERT_NODE_SIZE, height: INSERT_NODE_SIZE },
      data: {
        ariaLabel: `Insert step at position ${stepIndex + 1}`,
        insertionPoint,
      } satisfies InsertFlowNodeData,
      draggable: false,
    });

    currentY += INSERT_NODE_SIZE + OUTER_STEP_GAP;

    if (stepIndex >= steps.length) {
      break;
    }

    const step = steps[stepIndex];
    const stepNodeId = `${nodeIdPrefix}__step-${stepIndex}`;
    const stepPath: StepPath = [...parentPath, { arrayKey, stepIndex }];
    const isBlockStep = BLOCK_STEP_ACTIONS.has(step.action);
    const nextInsertNodeId = `${nodeIdPrefix}__insert-${stepIndex + 1}`;

    if (isBlockStep) {
      const groupWidth = computeBlockGroupWidth(step);
      const groupHeight = computeBlockGroupHeight(step);
      const groupX = STEP_NODE_WIDTH / 2 - groupWidth / 2;

      const { groupNode, childNodes, childEdges } = buildBlockGroupContent(
        step,
        stepNodeId,
        groupWidth,
        groupHeight,
        stepPath,
        stepValidationSeverityByKey,
      );

      groupNode.position = { x: groupX, y: currentY };
      groupNode.zIndex = -1;

      nodes.push(groupNode, ...childNodes);
      edges.push(...childEdges);

      edges.push(
        {
          id: `${insertNodeId}-${stepNodeId}`,
          type: "straight",
          source: insertNodeId,
          target: stepNodeId,
          style: getFlowEdgeStyle(),
        },
        {
          id: `${stepNodeId}-${nextInsertNodeId}`,
          type: "straight",
          source: stepNodeId,
          target: nextInsertNodeId,
          style: getFlowEdgeStyle(),
        },
      );

      currentY += groupHeight + OUTER_STEP_GAP;
    } else {
      nodes.push({
        id: stepNodeId,
        type: "stepNode",
        position: { x: 0, y: currentY },
        width: STEP_NODE_WIDTH,
        height: STEP_NODE_HEIGHT,
        style: { width: STEP_NODE_WIDTH, height: STEP_NODE_HEIGHT },
        data: {
          title: `Step ${stepIndex + 1}: ${formatActionTypeLabel(step.action)}`,
          summary: summarizeStep(step),
          stepPath,
          validationSeverity: lookupValidationSeverity(stepValidationSeverityByKey, stepPath),
        } satisfies StepFlowNodeData,
        draggable: false,
      });

      edges.push(
        {
          id: `${insertNodeId}-${stepNodeId}`,
          type: "straight",
          source: insertNodeId,
          target: stepNodeId,
          style: getFlowEdgeStyle(),
        },
        {
          id: `${stepNodeId}-${nextInsertNodeId}`,
          type: "straight",
          source: stepNodeId,
          target: nextInsertNodeId,
          style: getFlowEdgeStyle(),
        },
      );

      currentY += STEP_NODE_HEIGHT + OUTER_STEP_GAP;
    }
  }

  return { nodes, edges };
}
