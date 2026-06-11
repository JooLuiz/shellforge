import type { ProfileIssueCode } from "../types";

export type Locale = "en" | "pt-BR";

export interface ProfileIssueTranslation {
  message: string;
  remediation: string;
}

export interface AppTranslationDictionary {
  menu: {
    file: string;
    newCustomAction: string;
    newScheduledTask: string;
    quit: string;
    view: string;
    language: string;
    languageEnglish: string;
    languagePortuguese: string;
    help: string;
    website: string;
    github: string;
  };
  app: {
    brandTitle: string;
    loading: string;
    failedToLoadConfig: string;
    saving: string;
    searchPredefined: string;
    searchCustomActions: string;
    searchScheduledTasks: string;
    newAction: string;
    newSchedule: string;
    bridgeUnavailable: string;
    unknownLoadError: string;
    unknownSaveError: string;
    unknownScheduledTasksLoadError: string;
    regenerateProfileFailed: string;
  };
  tabs: {
    predefined: string;
    custom: string;
    scheduled: string;
    predefinedTitle: string;
    customTitle: string;
    scheduledTitle: string;
    predefinedDescription: string;
    customDescription: string;
    scheduledDescription: string;
  };
  profileHealth: {
    title: string;
    profilePathLabel: string;
    regenerateProfileBlock: string;
    openProfileFolder: string;
    issues: Record<ProfileIssueCode, ProfileIssueTranslation>;
  };
  footer: {
    copyright: string;
    themeLight: string;
    themeDark: string;
    themeToggleLabel: string;
  };
  customActions: {
    noSearchResults: string;
  };
  scheduledTasks: {
    noSearchResults: string;
  };
}
