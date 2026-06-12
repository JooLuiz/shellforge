import { useMemo } from "react";
import type { ActionStep } from "../../../../shared/types";
import type { FlowBreadcrumbSegment, StepPath } from "../types";
import {
  buildBreadcrumbSegments,
  isBlockStepAction,
  normalizeContainerPath,
} from "../utils/flowScope";
import { getStepAtPath } from "../utils/stepPath";

interface UseFlowScopeInput {
  currentEditorActionSteps: ActionStep[];
  editorActionName: string;
  flowContainerPath: StepPath;
  hasEditorDraft: boolean;
  setFlowContainerPathState: (nextPath: StepPath) => void;
  setSelectedStepPath: (nextPath: StepPath | null) => void;
}

interface UseFlowScopeResult {
  enterBlockScope: (blockStepPath: StepPath) => void;
  flowBreadcrumbSegments: FlowBreadcrumbSegment[];
  normalizedFlowContainerPath: StepPath;
  setFlowContainerPath: (nextPath: StepPath) => void;
}

export function useFlowScope({
  currentEditorActionSteps,
  editorActionName,
  flowContainerPath,
  hasEditorDraft,
  setFlowContainerPathState,
  setSelectedStepPath,
}: UseFlowScopeInput): UseFlowScopeResult {
  const normalizedFlowContainerPath = useMemo(
    () => normalizeContainerPath(currentEditorActionSteps, flowContainerPath),
    [currentEditorActionSteps, flowContainerPath],
  );

  const flowBreadcrumbSegments = useMemo(() => {
    if (!hasEditorDraft) {
      return [];
    }
    return buildBreadcrumbSegments(
      currentEditorActionSteps,
      normalizedFlowContainerPath,
      editorActionName,
    );
  }, [currentEditorActionSteps, editorActionName, hasEditorDraft, normalizedFlowContainerPath]);

  const setFlowContainerPath = (nextPath: StepPath): void => {
    setFlowContainerPathState(normalizeContainerPath(currentEditorActionSteps, nextPath));
    setSelectedStepPath(null);
  };

  const enterBlockScope = (blockStepPath: StepPath): void => {
    const blockStep = getStepAtPath(currentEditorActionSteps, blockStepPath);
    if (!blockStep || !isBlockStepAction(blockStep.action)) {
      return;
    }
    setFlowContainerPathState(blockStepPath);
  };

  return {
    enterBlockScope,
    flowBreadcrumbSegments,
    normalizedFlowContainerPath,
    setFlowContainerPath,
  };
}
