import { browserStepDefinitions } from "./browserSteps";
import { controlFlowStepDefinitions } from "./controlFlowSteps";
import { coreStepDefinitions } from "./coreSteps";
import type { StepDocEntry } from "./types";

export type { StepDocEntry, StepFieldDoc, FieldRequirement } from "./types";
export { actionLevelFields } from "./controlFlowSteps";

export const STEP_DEFINITIONS: StepDocEntry[] = [
  ...browserStepDefinitions,
  ...coreStepDefinitions,
  ...controlFlowStepDefinitions,
];

export const STEP_DEFINITIONS_BY_CATEGORY = {
  browser: STEP_DEFINITIONS.filter((entry) => entry.category === "browser"),
  timing: STEP_DEFINITIONS.filter((entry) => entry.category === "timing"),
  data: STEP_DEFINITIONS.filter((entry) => entry.category === "data"),
  controlFlow: STEP_DEFINITIONS.filter((entry) => entry.category === "controlFlow"),
};
