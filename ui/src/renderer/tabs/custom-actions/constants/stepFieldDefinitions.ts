import type { StepFieldDefinition } from "../types";
import { browserAutomationStepFields } from "./fields/browserAutomationFields";
import { browserInteractionStepFields } from "./fields/browserInteractionFields";
import { controlFlowStepFields } from "./fields/controlFlowFields";
import { integrationStepFields } from "./fields/integrationFields";

export const STEP_FIELD_DEFINITIONS: Record<string, StepFieldDefinition[]> = {
  ...browserInteractionStepFields,
  ...browserAutomationStepFields,
  ...controlFlowStepFields,
  ...integrationStepFields,
};
