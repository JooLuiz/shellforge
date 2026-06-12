import { useMemo } from "react";
import type { ActionStep } from "../../../../shared/types";
import type { StepPath } from "../types";
import { getStepAtPath, stepPathToKey } from "../utils/stepPath";

interface UseSelectedStepInput {
  currentEditorActionSteps: ActionStep[];
  selectedStepPath: StepPath | null;
}

interface UseSelectedStepResult {
  selectedStep: ActionStep | null;
  selectedStepPathKey: string;
}

export function useSelectedStep({
  currentEditorActionSteps,
  selectedStepPath,
}: UseSelectedStepInput): UseSelectedStepResult {
  const selectedStep = useMemo(() => {
    if (!selectedStepPath || selectedStepPath.length === 0) {
      return null;
    }
    return getStepAtPath(currentEditorActionSteps, selectedStepPath);
  }, [currentEditorActionSteps, selectedStepPath]);

  const selectedStepPathKey = selectedStepPath ? stepPathToKey(selectedStepPath) : "none";

  return {
    selectedStep,
    selectedStepPathKey,
  };
}
