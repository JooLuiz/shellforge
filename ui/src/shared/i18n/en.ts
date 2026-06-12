import type { AppTranslationDictionary } from "./types";

export const enDictionary: AppTranslationDictionary = {
  menu: {
    file: "File",
    newCustomAction: "New Custom Action",
    newScheduledTask: "New Scheduled Task",
    quit: "Quit",
    view: "View",
    language: "Language",
    languageEnglish: "English",
    languagePortuguese: "Português (Brasil)",
    help: "Help",
    website: "ShellForge Website",
    github: "GitHub Repository",
  },
  app: {
    brandTitle: "ShellForge",
    loading: "Loading desktop manager...",
    failedToLoadConfig: "Failed to load config.",
    saving: "Saving...",
    searchPredefined: "Search predefined commands...",
    searchCustomActions: "Search custom actions...",
    searchScheduledTasks: "Search scheduled tasks...",
    newAction: "New Action",
    newSchedule: "New Schedule",
    bridgeUnavailable:
      "Desktop bridge unavailable (window.api). Restart the app after rebuilding the UI.",
    unknownLoadError: "Unknown load error",
    unknownSaveError: "Unknown save error",
    unknownScheduledTasksLoadError: "Unknown scheduled tasks load error",
    regenerateProfileFailed: "Unable to regenerate profile block.",
  },
  tabs: {
    predefined: "Pre-defined Commands",
    custom: "Custom Actions",
    scheduled: "Scheduled Tasks",
    predefinedTitle: "Pre-defined Commands",
    customTitle: "Custom Actions",
    scheduledTitle: "Scheduled Tasks",
    predefinedDescription:
      "List of pre-defined commands to help guarantee a better experience when using Windows in CLI.",
    customDescription: "List of configurable custom actions.",
    scheduledDescription: "List of tasks to be executed on pre-defined moments.",
  },
  profileHealth: {
    title: "PowerShell profile needs attention",
    profilePathLabel: "Profile path:",
    regenerateProfileBlock: "Regenerate profile block",
    openProfileFolder: "Open profile folder",
    issues: {
      profilePathUnresolved: {
        message: "Unable to resolve PowerShell profile path.",
        remediation:
          "Restart ShellForge. If the issue persists, open PowerShell once manually and confirm that $PROFILE.CurrentUserCurrentHost resolves to a valid path.",
      },
      profileDirectoryNotWritable: {
        message: "ShellForge cannot write to the profile folder.",
        remediation:
          "Fix folder permissions, disable read-only on the folder, or resolve OneDrive/sync restrictions on your Documents folder.",
      },
      profileFileNotWritable: {
        message: "ShellForge cannot update your PowerShell profile file.",
        remediation:
          "Remove the read-only flag on the profile file or adjust file permissions so your user account can edit it.",
      },
      executionPolicyRestricted: {
        message:
          "PowerShell execution policy for CurrentUser is restricted, which can block profile scripts.",
        remediation:
          "Run in PowerShell: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned. This allows local profile scripts (including ShellForge aliases) to load.",
      },
      managedBlockMissing: {
        message: "The ShellForge managed block is missing from your PowerShell profile.",
        remediation:
          "Save any change in Pre-defined Commands or Custom Actions to regenerate the profile block, or click Regenerate profile block below.",
      },
    },
  },
  footer: {
    copyright: "© 2024–2026 ShellForge. All rights reserved. Developed by Joao Luiz de Castro",
    themeLight: "Light",
    themeDark: "Dark",
    themeToggleLabel: "Toggle theme",
  },
  customActions: {
    noSearchResults: "No custom actions match the current search.",
  },
  scheduledTasks: {
    noSearchResults: "No scheduled tasks match the current search.",
  },
  deleteConfirm: {
    cancel: "Cancel",
    confirm: "Delete",
    deleting: "Deleting...",
    customAction: {
      title: "Delete action {itemName}?",
      description: "This permanently removes the action from your config. This cannot be undone.",
    },
    scheduledTask: {
      title: "Delete scheduled task {itemName}?",
      description: "This permanently removes the scheduled task file. This cannot be undone.",
    },
  },
};
