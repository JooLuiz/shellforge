import type { ActionStep } from "../../../../shared/types";

// --- Outer flow layout ---
export const FLOW_TOP_PADDING = 40;
export const OUTER_STEP_GAP = 20;

// --- Leaf step node dimensions ---
export const STEP_NODE_WIDTH = 280;
export const STEP_NODE_HEIGHT = 72;

// --- Insert node dimensions ---
export const INSERT_NODE_SIZE = 42;

// --- Block group layout ---
export const BLOCK_PADDING = 16;
export const BLOCK_TITLE_HEIGHT = 28;
export const BLOCK_LANE_GAP = 8;
export const BLOCK_LANE_COLUMN_GAP = 12;

// --- Derived ---
export const BLOCK_STEP_ACTIONS = new Set(["forEach", "forEachElement", "tryCatch", "ifElse"]);

/**
 * The keys within a tryCatch step that each hold a sub-step array,
 * in display order.
 */
export const TRYCATCH_LANE_KEYS = ["try", "catch", "finally"] as const;

/**
 * The keys within an ifElse step that each hold a sub-step array,
 * in display order.
 */
export const IFELSE_LANE_KEYS = ["then", "else"] as const;

/**
 * The key within a forEach / forEachElement step that holds sub-steps.
 */
export const FOREACH_LANE_KEY = "steps" as const;

/**
 * Computes the height (in pixels) of a single inner sub-step column
 * that contains `subStepCount` steps.
 *
 * Column layout (top to bottom):
 *   insert[0]
 *   step[0]
 *   insert[1]
 *   ...
 *   step[N-1]
 *   insert[N]
 */
export function computeColumnHeight(subStepCount: number): number {
  const insertCount = subStepCount + 1;
  const stepCount = subStepCount;
  const gapCount = insertCount + stepCount - 1;

  return (
    insertCount * INSERT_NODE_SIZE +
    stepCount * STEP_NODE_HEIGHT +
    gapCount * BLOCK_LANE_GAP
  );
}

/**
 * Computes the full rendered height of a block group node based on its
 * sub-step content.
 */
export function computeBlockGroupHeight(step: ActionStep): number {
  let maxColumnHeight = computeColumnHeight(0);

  if (step.action === "tryCatch") {
    for (const laneKey of TRYCATCH_LANE_KEYS) {
      const subSteps = step[laneKey];
      const count = Array.isArray(subSteps) ? subSteps.length : 0;
      maxColumnHeight = Math.max(maxColumnHeight, computeColumnHeight(count));
    }
  } else if (step.action === "ifElse") {
    for (const laneKey of IFELSE_LANE_KEYS) {
      const subSteps = step[laneKey];
      const count = Array.isArray(subSteps) ? subSteps.length : 0;
      maxColumnHeight = Math.max(maxColumnHeight, computeColumnHeight(count));
    }
  } else {
    const subSteps = step[FOREACH_LANE_KEY];
    const count = Array.isArray(subSteps) ? subSteps.length : 0;
    maxColumnHeight = computeColumnHeight(count);
  }

  return BLOCK_PADDING + BLOCK_TITLE_HEIGHT + BLOCK_LANE_GAP + maxColumnHeight + BLOCK_PADDING;
}

/**
 * Computes the full rendered width of a block group node.
 */
export function computeBlockGroupWidth(step: ActionStep): number {
  const columnCount =
    step.action === "tryCatch" ? 3 : step.action === "ifElse" ? 2 : 1;
  return (
    BLOCK_PADDING * 2 +
    STEP_NODE_WIDTH * columnCount +
    BLOCK_LANE_COLUMN_GAP * (columnCount - 1)
  );
}

/**
 * Returns the height a step occupies in the outer flow canvas.
 * For leaf steps this is STEP_NODE_HEIGHT; for block steps it is
 * the full group node height.
 */
export function computeStepSlotHeight(step: ActionStep): number {
  if (BLOCK_STEP_ACTIONS.has(step.action)) {
    return computeBlockGroupHeight(step);
  }
  return STEP_NODE_HEIGHT;
}
