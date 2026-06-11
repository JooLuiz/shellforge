import type {
  ActionConfig,
  ActionStep,
  CustomActionUiConfig,
  StepPath,
  StepPathSegment,
} from "../../../shared/types";

export type { StepPath, StepPathSegment };

export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "stringArray"
  | "object"
  | "json"
  | "select";

export type EditorMode = "create" | "edit" | null;

export type EditSaveStatus = "dirty" | "saving" | "saved";

export interface StepFieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  /** One-line description of what the field does. */
  hint?: string;
  /** Concrete example value shown below the hint. */
  example?: string;
  /** When present, the field is only rendered when this returns true for the current step. */
  visibleWhen?: (step: ActionStep) => boolean;
  /** Options for select fields. */
  options?: readonly string[];
  /** When true, field supports {{context.*}} / {{env.*}} interpolation UX. */
  supportsInterpolation?: boolean;
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

/** Identifies where a new step should be inserted within the step tree. */
export interface InsertionPoint {
  /** Path to the parent block step. Empty array means top-level. */
  parentPath: StepPath;
  /** The key in the parent step that holds the target sub-step array. */
  arrayKey: string;
  insertionIndex: number;
}

export interface StepFlowNodeData {
  title: string;
  summary: string;
  stepPath: StepPath;
  validationSeverity?: "error" | "warning";
}

export interface InsertFlowNodeData {
  ariaLabel: string;
  insertionPoint: InsertionPoint;
}

export interface BlockGroupNodeData {
  actionKey: string;
  stepPath: StepPath;
  validationSeverity?: "error" | "warning";
}

export interface FlowBreadcrumbSegment {
  label: string;
  containerPath: StepPath;
}
