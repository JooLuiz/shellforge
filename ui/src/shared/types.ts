export type { PredefinedCommandKey } from "./predefinedCommandsRegistry";
import type { PredefinedCommandKey } from "./predefinedCommandsRegistry";
export type { ThemeMode } from "./themeBridge";
import type { ThemeMode } from "./themeBridge";
import type { Locale } from "./i18n/types";

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
  currentUserExecutionPolicy: string | null;
  issues: ProfileIssue[];
  isHealthy: boolean;
}

export type ProfileIssueCode =
  | "profilePathUnresolved"
  | "profileDirectoryNotWritable"
  | "profileFileNotWritable"
  | "executionPolicyRestricted"
  | "managedBlockMissing";

export interface ProfileIssue {
  code: ProfileIssueCode;
  message: string;
  remediation: string;
}

export interface ScheduledTaskCommandMetadata {
  version: 1;
  kind: "customActionAlias" | "custom";
  alias?: string;
  actionName?: string;
  verbose?: boolean;
  actionArgs?: Record<string, string>;
}

export interface ScheduledTaskRecord {
  fileName: string;
  actionName: string;
  triggerTimes: string[];
  weekdays: string[];
  command: string;
  commandMetadata?: ScheduledTaskCommandMetadata;
  isEnabled: boolean;
  parseError?: string;
  actionNameError?: string;
}

export interface ScheduledTaskInput {
  originalFileName?: string;
  actionName: string;
  triggerTimes: string[];
  weekdays: string[];
  command: string;
  commandMetadata?: ScheduledTaskCommandMetadata;
}

export interface RunCustomActionInput {
  actionName: string;
  args: Record<string, string>;
}

export interface RunCustomActionResult {
  stdout: string;
  stderr: string;
}

export interface StepPathSegment {
  arrayKey: string;
  stepIndex: number;
}

/** Addresses any step in the nested step tree. */
export type StepPath = StepPathSegment[];

export interface ContextValidationWarning {
  stepPath: StepPath;
  fieldPath: string;
  variableName: string;
}

export interface ActionRuntimeVariableContext {
  availableVariables: string[];
  warnings: ContextValidationWarning[];
}

export interface ScheduledTaskPrivilegesStatus {
  isAdministrator: boolean;
}

export interface AppApi {
  config: {
    read: () => Promise<AppConfig>;
    write: (config: AppConfig) => Promise<void>;
  };
  profile: {
    status: () => Promise<ProfileStatus>;
    regenerate: () => Promise<void>;
    openFolder: () => Promise<void>;
  };
  scheduledTasks: {
    list: () => Promise<ScheduledTaskRecord[]>;
    save: (input: ScheduledTaskInput) => Promise<string>;
    delete: (fileName: string) => Promise<void>;
    toggle: (fileName: string, isEnabled: boolean) => Promise<void>;
    getPrivileges: () => Promise<ScheduledTaskPrivilegesStatus>;
  };
  customActions: {
    run: (input: RunCustomActionInput) => Promise<RunCustomActionResult>;
  };
  browserProfiles: {
    list: () => Promise<string[]>;
  };
  theme: {
    set: (theme: ThemeMode) => Promise<void>;
  };
  locale: {
    sync: (locale: Locale) => Promise<void>;
    get: () => Promise<Locale>;
    onChanged: (callback: (locale: Locale) => void) => () => void;
  };
  app: {
    onNewCustomAction: (callback: () => void) => () => void;
    onNewScheduledTask: (callback: () => void) => () => void;
  };
}
