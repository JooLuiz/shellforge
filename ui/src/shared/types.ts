export type PredefinedCommandKey = "reinitialize" | "touch" | "action-runner";

export interface PredefinedCommandConfig {
  enabled: boolean;
  alias: string;
}

export interface CustomActionUiConfig {
  availableOnCLI: boolean;
  aliases: string[];
}

export interface UiConfig {
  predefinedCommands: Record<PredefinedCommandKey, PredefinedCommandConfig>;
  customActions: Record<string, CustomActionUiConfig>;
}

export interface ActionStep {
  action: string;
  [key: string]: unknown;
}

export interface ActionConfig {
  steps?: ActionStep[];
  [key: string]: unknown;
}

export interface AppConfig {
  actionRunner: Record<string, ActionConfig>;
  scheduler?: Record<string, unknown>;
  ui: UiConfig;
  [key: string]: unknown;
}

export interface ProfileStatus {
  profilePath: string;
  blockPresent: boolean;
}

export interface ScheduledTaskRecord {
  fileName: string;
  actionName: string;
  triggerTimes: string[];
  weekdays: string[];
  command: string;
  isEnabled: boolean;
  parseError?: string;
}

export interface ScheduledTaskInput {
  originalFileName?: string;
  actionName: string;
  triggerTimes: string[];
  weekdays: string[];
  command: string;
}

export interface RunCustomActionInput {
  actionName: string;
  args: Record<string, string>;
}

export interface RunCustomActionResult {
  stdout: string;
  stderr: string;
}

export interface ContextValidationWarning {
  stepIndex: number;
  fieldPath: string;
  variableName: string;
}

export interface ActionRuntimeVariableContext {
  availableVariables: string[];
  warnings: ContextValidationWarning[];
}

export interface AppApi {
  config: {
    read: () => Promise<AppConfig>;
    write: (config: AppConfig) => Promise<void>;
  };
  profile: {
    status: () => Promise<ProfileStatus>;
    regenerate: () => Promise<void>;
  };
  scheduledTasks: {
    list: () => Promise<ScheduledTaskRecord[]>;
    save: (input: ScheduledTaskInput) => Promise<string>;
    delete: (fileName: string) => Promise<void>;
    toggle: (fileName: string, isEnabled: boolean) => Promise<void>;
  };
  customActions: {
    run: (input: RunCustomActionInput) => Promise<RunCustomActionResult>;
  };
}
