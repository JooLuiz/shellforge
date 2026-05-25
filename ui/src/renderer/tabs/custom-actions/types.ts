import type {
  ActionConfig,
  ActionStep,
  CustomActionUiConfig,
} from "../../../shared/types";

export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "stringArray"
  | "object"
  | "json";

export type EditorMode = "create" | "edit" | null;

export type EditSaveStatus = "dirty" | "saving" | "saved";

export interface StepFieldDefinition {
  key: string;
  label: string;
  type: FieldType;
}

export interface ActionEditorDraft {
  actionName: string;
  actionConfig: ActionConfig;
  customActionUi: CustomActionUiConfig;
}

export type StepUpdater = (step: ActionStep) => ActionStep;

export interface RowMetadataPatch {
  availableOnCLI?: boolean;
  primaryAlias?: string;
}
