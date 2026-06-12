import type { StepCategory } from "../../i18n/types";

export type FieldRequirement = "yes" | "no" | "conditional" | "oneOf";

export interface StepFieldDoc {
  key: string;
  type: string;
  required: FieldRequirement;
  interpolation: boolean;
  example?: string;
}

export interface StepDocEntry {
  action: string;
  category: StepCategory;
  fields: StepFieldDoc[];
  exampleJson: string;
  nestedKeys?: string[];
}

/**
 * Sync with ui/src/renderer/tabs/custom-actions/constants.ts and README.md.
 */
