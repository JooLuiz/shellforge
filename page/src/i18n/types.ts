export type Locale = "en" | "pt-BR";

export type StepCategory = "browser" | "timing" | "data" | "controlFlow";

export interface TranslationDictionary {
  meta: {
    siteDescription: string;
    windowsOnlyNote: string;
  };
  nav: {
    home: string;
    gettingStarted: string;
    desktopUi: string;
    actionSteps: string;
    predefinedCommands: string;
    configuration: string;
  };
  common: {
    copy: string;
    copied: string;
    comingSoon: string;
    downloadWindows: string;
    viewOnGitHub: string;
    browseActionSteps: string;
    gettingStarted: string;
    param: string;
    type: string;
    required: string;
    interpolation: string;
    description: string;
    example: string;
    notes: string;
    yes: string;
    no: string;
    optional: string;
    conditional: string;
    screenshotPlaceholder: string;
    categoryBrowser: string;
    categoryTiming: string;
    categoryData: string;
    categoryControlFlow: string;
    openMenu: string;
    closeMenu: string;
  };
  home: {
    tag: string;
    title: string;
    subtitle: string;
    versionBadge: string;
    valuePropsTitle: string;
    valueProp1: string;
    valueProp2: string;
    valueProp3: string;
    valueProp4: string;
    valueProp5: string;
    examplesTitle: string;
    exampleLoginTitle: string;
    exampleApiTitle: string;
  };
  gettingStarted: {
    title: string;
    subtitle: string;
    requirementsTitle: string;
    requirementsBody: string;
    installTitle: string;
    installBody: string;
    installSizeTitle: string;
    installSizeBody: string;
    firstLaunchTitle: string;
    firstLaunchBody: string;
    enableCommandTitle: string;
    enableCommandBody: string;
    cliTitle: string;
    cliBody: string;
    argsTitle: string;
    argsBody: string;
    filesTitle: string;
    filesBody: string;
    troubleshootingTitle: string;
    troubleshootingItems: string[];
  };
  desktopUi: {
    title: string;
    subtitle: string;
    intro: string;
    predefinedTitle: string;
    predefinedBody: string;
    customTitle: string;
    customBody: string;
    scheduledTitle: string;
    scheduledBody: string;
    footerNote: string;
  };
  actionSteps: {
    title: string;
    subtitle: string;
    introInterpolation: string;
    introNested: string;
    introBrowserProfile: string;
    workflowsTitle: string;
    steps: Record<string, { summary: string; notes?: string }>;
    fieldHints: Record<string, string>;
    actionLevelTitle: string;
    actionLevelBody: string;
  };
  predefined: {
    title: string;
    subtitle: string;
    usageLabel: string;
  };
  configuration: {
    title: string;
    subtitle: string;
    configTitle: string;
    configBody: string;
    interpolationTitle: string;
    interpolationBody: string;
    profilesTitle: string;
    profilesBody: string;
    cliTitle: string;
    profileBlockTitle: string;
    profileBlockBody: string;
    scheduledTitle: string;
    scheduledBody: string;
    devTitle: string;
    devBody: string;
    cliRows: Array<{ param: string; required: string; description: string }>;
  };
  categories: {
    core: string;
    shellLifecycle: string;
    unixParity: string;
    windowsUtilities: string;
  };
  commands: Record<string, { description: string; usage: string }>;
}
