import type { ActionStep } from "../../../../../shared/types";
import type { StepFieldDefinition } from "../../types";

export const controlFlowStepFields: Record<string, StepFieldDefinition[]> = {
  wait: [
    {
      key: "ms",
      label: "Milliseconds",
      type: "number",
      hint: "How long to pause execution",
      example: "2000",
    },
  ],
  forEach: [
    {
      key: "list",
      label: "List (JSON array)",
      type: "json",
      supportsInterpolation: true,
      hint: "JSON array or {{context.*}} reference — each item is available as {{context.item}}",
      example: '{{context.userIds}} or ["apple", "banana"]',
      visibleWhen: (step: ActionStep) => step.count === undefined,
    },
    {
      key: "count",
      label: "Count",
      type: "number",
      hint: "Number of times to repeat the sub-steps",
      example: "5",
      visibleWhen: (step: ActionStep) => step.count !== undefined,
    },
  ],
  tryCatch: [],
  ifElse: [],
};
