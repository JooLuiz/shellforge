import { useMemo } from "react";
import type { ActionStep } from "../../../../shared/types";
import type { StepPath } from "../types";
import { buildFlowNodesAndEdges } from "../utils/flow";
import type { FlowValidationSeverity } from "../utils/flowValidationUtils";

interface UseFlowGraphInput {
  currentEditorActionSteps: ActionStep[];
  normalizedFlowContainerPath: StepPath;
  stepValidationSeverityByKey: Map<string, FlowValidationSeverity>;
}

export function useFlowGraph({
  currentEditorActionSteps,
  normalizedFlowContainerPath,
  stepValidationSeverityByKey,
}: UseFlowGraphInput): ReturnType<typeof buildFlowNodesAndEdges> {
  return useMemo(
    () =>
      buildFlowNodesAndEdges(
        currentEditorActionSteps,
        normalizedFlowContainerPath,
        stepValidationSeverityByKey,
      ),
    [currentEditorActionSteps, normalizedFlowContainerPath, stepValidationSeverityByKey],
  );
}
