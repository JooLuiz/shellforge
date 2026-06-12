import type { ActionStep } from "../../../../shared/types";
import type { InsertionPoint, StepPath } from "../types";

/**
 * Reads the sub-step array at the given key from a step.
 * Returns an empty array if the key is missing or not an array.
 */
function getSubSteps(step: ActionStep, arrayKey: string): ActionStep[] {
  const value = step[arrayKey];
  return Array.isArray(value) ? (value as ActionStep[]) : [];
}

/**
 * Returns the step addressed by `path` within `rootSteps`, or null if not found.
 * An empty path returns null (callers should handle root-level access separately).
 */
export function getStepAtPath(rootSteps: ActionStep[], path: StepPath): ActionStep | null {
  if (path.length === 0) {
    return null;
  }

  const [firstSegment, ...remainingPath] = path;
  const step = rootSteps[firstSegment.stepIndex] ?? null;

  if (!step) {
    return null;
  }

  if (remainingPath.length === 0) {
    return step;
  }

  const subSteps = getSubSteps(step, remainingPath[0].arrayKey);
  return getStepAtPath(subSteps, remainingPath);
}

/**
 * Returns a new root steps array with the step at `path` replaced by `nextStep`.
 * Produces a fully new immutable tree — does not mutate inputs.
 */
export function setStepAtPath(
  rootSteps: ActionStep[],
  path: StepPath,
  nextStep: ActionStep,
): ActionStep[] {
  if (path.length === 0) {
    return rootSteps;
  }

  const [firstSegment, ...remainingPath] = path;
  const updated = [...rootSteps];

  if (remainingPath.length === 0) {
    updated[firstSegment.stepIndex] = nextStep;
    return updated;
  }

  const parentStep = updated[firstSegment.stepIndex];
  if (!parentStep) {
    return rootSteps;
  }

  const nextArrayKey = remainingPath[0].arrayKey;
  const subSteps = getSubSteps(parentStep, nextArrayKey);
  const updatedSubSteps = setStepAtPath(subSteps, remainingPath, nextStep);

  updated[firstSegment.stepIndex] = { ...parentStep, [nextArrayKey]: updatedSubSteps };
  return updated;
}

/**
 * Returns a new root steps array with `newStep` inserted at `insertionPoint`.
 * Produces a fully new immutable tree — does not mutate inputs.
 */
export function addStepAtPath(
  rootSteps: ActionStep[],
  insertionPoint: InsertionPoint,
  newStep: ActionStep,
): ActionStep[] {
  const { parentPath, arrayKey, insertionIndex } = insertionPoint;

  if (parentPath.length === 0) {
    const updated = [...rootSteps];
    const boundedIndex = Math.max(0, Math.min(insertionIndex, updated.length));
    updated.splice(boundedIndex, 0, newStep);
    return updated;
  }

  const [firstSegment, ...remainingPath] = parentPath;
  const updated = [...rootSteps];
  const parentStep = updated[firstSegment.stepIndex];
  if (!parentStep) {
    return rootSteps;
  }

  const nextArrayKey = remainingPath.length > 0 ? remainingPath[0].arrayKey : arrayKey;

  if (remainingPath.length === 0) {
    const subSteps = getSubSteps(parentStep, arrayKey);
    const updatedSubSteps = [...subSteps];
    const boundedIndex = Math.max(0, Math.min(insertionIndex, updatedSubSteps.length));
    updatedSubSteps.splice(boundedIndex, 0, newStep);
    updated[firstSegment.stepIndex] = { ...parentStep, [arrayKey]: updatedSubSteps };
    return updated;
  }

  const subSteps = getSubSteps(parentStep, nextArrayKey);
  const updatedSubSteps = addStepAtPath(subSteps, { parentPath: remainingPath, arrayKey, insertionIndex }, newStep);
  updated[firstSegment.stepIndex] = { ...parentStep, [nextArrayKey]: updatedSubSteps };
  return updated;
}

/**
 * Returns a new root steps array with the step at `path` removed.
 * Produces a fully new immutable tree — does not mutate inputs.
 */
export function deleteStepAtPath(rootSteps: ActionStep[], path: StepPath): ActionStep[] {
  if (path.length === 0) {
    return rootSteps;
  }

  const [firstSegment, ...remainingPath] = path;

  if (remainingPath.length === 0) {
    return rootSteps.filter((_step, index) => index !== firstSegment.stepIndex);
  }

  const updated = [...rootSteps];
  const parentStep = updated[firstSegment.stepIndex];
  if (!parentStep) {
    return rootSteps;
  }

  const nextArrayKey = remainingPath[0].arrayKey;
  const subSteps = getSubSteps(parentStep, nextArrayKey);
  const updatedSubSteps = deleteStepAtPath(subSteps, remainingPath);
  updated[firstSegment.stepIndex] = { ...parentStep, [nextArrayKey]: updatedSubSteps };
  return updated;
}

/** Serialises a StepPath to a stable string key, usable in React keys and state maps. */
export function stepPathToKey(path: StepPath): string {
  return path.map((segment) => `${segment.arrayKey}.${segment.stepIndex}`).join("/");
}
