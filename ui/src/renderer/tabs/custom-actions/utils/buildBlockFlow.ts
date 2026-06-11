import type { Edge, Node } from "reactflow";
import type { ActionStep } from "../../../../shared/types";
import type {
  BlockGroupNodeData,
  InsertFlowNodeData,
  InsertionPoint,
  StepFlowNodeData,
  StepPath,
} from "../types";
import {
  BLOCK_LANE_COLUMN_GAP,
  BLOCK_LANE_GAP,
  BLOCK_PADDING,
  BLOCK_TITLE_HEIGHT,
  FOREACH_LANE_KEY,
  INSERT_NODE_SIZE,
  STEP_NODE_HEIGHT,
  STEP_NODE_WIDTH,
  IFELSE_LANE_KEYS,
  TRYCATCH_LANE_KEYS,
  computeColumnHeight,
} from "./flowLayout";
import { summarizeStep } from "./stepUtils";
import { formatActionTypeLabel } from "./formatActionTypeLabel";
import {
  lookupValidationSeverity,
  type FlowValidationSeverity,
} from "./flowValidationUtils";
import { buildFlowEdgeProps } from "./flowEdgeStyle";

type StepValidationSeverityMap = Map<string, FlowValidationSeverity>;

/**
 * Builds the nodes and edges for a single sub-step column inside a block group.
 *
 * All produced nodes have `parentId` set to `groupNodeId` and positions relative
 * to the group's top-left corner. The caller is responsible for providing the
 * correct `columnOffsetX` so columns don't overlap.
 */
function buildColumnNodes(
  subSteps: ActionStep[],
  groupNodeId: string,
  columnOffsetX: number,
  columnOffsetY: number,
  arrayKey: string,
  parentStepPath: StepPath,
  stepValidationSeverityByKey: StepValidationSeverityMap,
): { childNodes: Node[]; childEdges: Edge[] } {
  const childNodes: Node<StepFlowNodeData | InsertFlowNodeData>[] = [];
  const childEdges: Edge[] = [];

  let currentY = columnOffsetY;

  for (let insertionIndex = 0; insertionIndex <= subSteps.length; insertionIndex += 1) {
    const insertNodeId = `${groupNodeId}__${arrayKey}__insert-${insertionIndex}`;

    const insertionPoint: InsertionPoint = {
      parentPath: parentStepPath,
      arrayKey,
      insertionIndex,
    };

    childNodes.push({
      id: insertNodeId,
      type: "insertNode",
      parentNode: groupNodeId,
      extent: "parent",
      position: { x: columnOffsetX + STEP_NODE_WIDTH / 2 - INSERT_NODE_SIZE / 2, y: currentY },
      width: INSERT_NODE_SIZE,
      height: INSERT_NODE_SIZE,
      style: { width: INSERT_NODE_SIZE, height: INSERT_NODE_SIZE },
      data: {
        ariaLabel: `Insert ${arrayKey} step at position ${insertionIndex + 1}`,
        insertionPoint,
      } satisfies InsertFlowNodeData,
      draggable: false,
    });

    currentY += INSERT_NODE_SIZE + BLOCK_LANE_GAP;

    if (insertionIndex < subSteps.length) {
      const subStep = subSteps[insertionIndex];
      const stepNodeId = `${groupNodeId}__${arrayKey}__step-${insertionIndex}`;

      const stepPath: StepPath = [
        ...parentStepPath,
        { arrayKey, stepIndex: insertionIndex },
      ];

      childNodes.push({
        id: stepNodeId,
        type: "stepNode",
        parentNode: groupNodeId,
        extent: "parent",
        position: { x: columnOffsetX, y: currentY },
        width: STEP_NODE_WIDTH,
        height: STEP_NODE_HEIGHT,
        style: { width: STEP_NODE_WIDTH, height: STEP_NODE_HEIGHT },
        data: {
          title: `${insertionIndex + 1}: ${formatActionTypeLabel(subStep.action)}`,
          summary: summarizeStep(subStep),
          stepPath,
          validationSeverity: lookupValidationSeverity(stepValidationSeverityByKey, stepPath),
        } satisfies StepFlowNodeData,
        draggable: false,
      });

      childEdges.push({
        id: `${insertNodeId}-${stepNodeId}`,
        type: "straight",
        source: insertNodeId,
        target: stepNodeId,
        ...buildFlowEdgeProps(),
      });

      const nextInsertNodeId = `${groupNodeId}__${arrayKey}__insert-${insertionIndex + 1}`;
      childEdges.push({
        id: `${stepNodeId}-${nextInsertNodeId}`,
        type: "straight",
        source: stepNodeId,
        target: nextInsertNodeId,
        ...buildFlowEdgeProps(),
      });

      currentY += STEP_NODE_HEIGHT + BLOCK_LANE_GAP;
    }
  }

  return { childNodes, childEdges };
}

/**
 * Builds the group node and all its internal child nodes / edges for a block step.
 *
 * The group node (`blockGroupNode`) is positioned in the outer flow by the caller.
 * Its `width` and `height` are computed from sub-step counts so ReactFlow can
 * enforce `extent: 'parent'` on all children.
 */
export function buildBlockGroupContent(
  step: ActionStep,
  groupNodeId: string,
  groupWidth: number,
  groupHeight: number,
  stepPath: StepPath,
  stepValidationSeverityByKey: StepValidationSeverityMap,
): { groupNode: Node<BlockGroupNodeData>; childNodes: Node[]; childEdges: Edge[] } {
  const groupNode: Node<BlockGroupNodeData> = {
    id: groupNodeId,
    type: "blockGroupNode",
    position: { x: 0, y: 0 },
    width: groupWidth,
    height: groupHeight,
    style: { width: groupWidth, height: groupHeight },
    data: {
      actionKey: step.action,
      stepPath,
      validationSeverity: lookupValidationSeverity(stepValidationSeverityByKey, stepPath),
    },
    draggable: false,
  };

  const childNodes: Node[] = [];
  const childEdges: Edge[] = [];

  const contentStartY = BLOCK_PADDING + BLOCK_TITLE_HEIGHT + BLOCK_LANE_GAP;

  if (step.action === "tryCatch") {
    TRYCATCH_LANE_KEYS.forEach((laneKey, columnIndex) => {
      const subSteps = Array.isArray(step[laneKey]) ? (step[laneKey] as ActionStep[]) : [];
      const columnOffsetX = BLOCK_PADDING + columnIndex * (STEP_NODE_WIDTH + BLOCK_LANE_COLUMN_GAP);

      const { childNodes: columnNodes, childEdges: columnEdges } = buildColumnNodes(
        subSteps,
        groupNodeId,
        columnOffsetX,
        contentStartY,
        laneKey,
        stepPath,
        stepValidationSeverityByKey,
      );

      childNodes.push(...columnNodes);
      childEdges.push(...columnEdges);
    });
  } else if (step.action === "ifElse") {
    IFELSE_LANE_KEYS.forEach((laneKey, columnIndex) => {
      const subSteps = Array.isArray(step[laneKey]) ? (step[laneKey] as ActionStep[]) : [];
      const columnOffsetX = BLOCK_PADDING + columnIndex * (STEP_NODE_WIDTH + BLOCK_LANE_COLUMN_GAP);

      const { childNodes: columnNodes, childEdges: columnEdges } = buildColumnNodes(
        subSteps,
        groupNodeId,
        columnOffsetX,
        contentStartY,
        laneKey,
        stepPath,
        stepValidationSeverityByKey,
      );

      childNodes.push(...columnNodes);
      childEdges.push(...columnEdges);
    });
  } else {
    const subSteps = Array.isArray(step[FOREACH_LANE_KEY])
      ? (step[FOREACH_LANE_KEY] as ActionStep[])
      : [];
    const columnOffsetX = BLOCK_PADDING;

    const { childNodes: columnNodes, childEdges: columnEdges } = buildColumnNodes(
      subSteps,
      groupNodeId,
      columnOffsetX,
      contentStartY,
      FOREACH_LANE_KEY,
      stepPath,
      stepValidationSeverityByKey,
    );

    childNodes.push(...columnNodes);
    childEdges.push(...columnEdges);
  }

  return { groupNode, childNodes, childEdges };
}

/** Produces a lane-header label string shown inside tryCatch columns. */
export function getLaneLabel(arrayKey: string, subStepCount: number): string {
  return `${arrayKey} (${subStepCount})`;
}

/** Returns the minimum group height needed to hold a given number of sub-steps per column. */
export function minGroupHeightForSteps(stepCount: number): number {
  return (
    BLOCK_PADDING +
    BLOCK_TITLE_HEIGHT +
    BLOCK_LANE_GAP +
    computeColumnHeight(stepCount) +
    BLOCK_PADDING
  );
}
