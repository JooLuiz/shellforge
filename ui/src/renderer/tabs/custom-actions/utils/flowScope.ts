import type { ActionStep } from "../../../../shared/types";
import type { FlowBreadcrumbSegment, StepPath } from "../types";
import { formatActionTypeLabel } from "./formatActionTypeLabel";
import { BLOCK_STEP_ACTIONS } from "./flowLayout";
import { getStepAtPath } from "./stepPath";

export function isBlockStepAction(action: string): boolean {
  return BLOCK_STEP_ACTIONS.has(action);
}

export function resolveFlowContainerStep(
  rootSteps: ActionStep[],
  containerPath: StepPath,
): ActionStep | null {
  if (containerPath.length === 0) {
    return null;
  }

  const containerStep = getStepAtPath(rootSteps, containerPath);
  if (!containerStep || !isBlockStepAction(containerStep.action)) {
    return null;
  }

  return containerStep;
}

export function normalizeContainerPath(
  rootSteps: ActionStep[],
  containerPath: StepPath,
): StepPath {
  if (containerPath.length === 0) {
    return [];
  }

  const containerStep = resolveFlowContainerStep(rootSteps, containerPath);
  if (!containerStep) {
    return [];
  }

  return containerPath;
}

function buildBlockStepLabel(step: ActionStep, stepIndex: number): string {
  return `Step ${stepIndex + 1}: ${formatActionTypeLabel(step.action)}`;
}

export function buildBreadcrumbSegments(
  rootSteps: ActionStep[],
  containerPath: StepPath,
  actionName: string,
): FlowBreadcrumbSegment[] {
  const trimmedActionName = actionName.trim();
  const rootLabel = trimmedActionName.length > 0 ? trimmedActionName : "Action";

  const segments: FlowBreadcrumbSegment[] = [
    {
      label: rootLabel,
      containerPath: [],
    },
  ];

  if (containerPath.length === 0) {
    return segments;
  }

  for (let segmentIndex = 0; segmentIndex < containerPath.length; segmentIndex += 1) {
    const partialPath = containerPath.slice(0, segmentIndex + 1);
    const stepAtPartialPath = getStepAtPath(rootSteps, partialPath);
    if (!stepAtPartialPath) {
      break;
    }

    const stepIndex = partialPath[partialPath.length - 1]?.stepIndex ?? 0;
    segments.push({
      label: buildBlockStepLabel(stepAtPartialPath, stepIndex),
      containerPath: partialPath,
    });
  }

  return segments;
}

export function isStepPathPrefix(prefixPath: StepPath, fullPath: StepPath): boolean {
  if (prefixPath.length > fullPath.length) {
    return false;
  }

  return prefixPath.every(
    (prefixSegment, segmentIndex) =>
      prefixSegment.arrayKey === fullPath[segmentIndex]?.arrayKey &&
      prefixSegment.stepIndex === fullPath[segmentIndex]?.stepIndex,
  );
}

export function getParentContainerPath(containerPath: StepPath): StepPath {
  if (containerPath.length <= 1) {
    return [];
  }

  return containerPath.slice(0, -1);
}

export function normalizeContainerPathAfterStepChange(
  rootSteps: ActionStep[],
  containerPath: StepPath,
  changedStepPath: StepPath,
  nextAction: string,
): StepPath {
  const normalizedContainerPath = normalizeContainerPath(rootSteps, containerPath);

  if (!isStepPathPrefix(changedStepPath, normalizedContainerPath)) {
    return normalizedContainerPath;
  }

  if (changedStepPath.length === normalizedContainerPath.length && !isBlockStepAction(nextAction)) {
    return getParentContainerPath(normalizedContainerPath);
  }

  return normalizedContainerPath;
}

export function resolveBlockScopeEntryPath(
  rootSteps: ActionStep[],
  stepPath: StepPath,
): StepPath | null {
  for (let pathLength = stepPath.length; pathLength >= 1; pathLength -= 1) {
    const candidatePath = stepPath.slice(0, pathLength);
    const candidateStep = getStepAtPath(rootSteps, candidatePath);
    if (candidateStep && isBlockStepAction(candidateStep.action)) {
      return candidatePath;
    }
  }

  return null;
}

export function normalizeContainerPathAfterDelete(
  rootSteps: ActionStep[],
  containerPath: StepPath,
  deletedStepPath: StepPath,
): StepPath {
  const normalizedContainerPath = normalizeContainerPath(rootSteps, containerPath);

  if (
    isStepPathPrefix(deletedStepPath, normalizedContainerPath) ||
    isStepPathPrefix(normalizedContainerPath, deletedStepPath)
  ) {
    return getParentContainerPath(normalizedContainerPath);
  }

  return normalizedContainerPath;
}
