import type { TranslationDictionary } from "./types";

export const en: TranslationDictionary = {
  meta: {
    siteDescription:
      "Build, run, and schedule custom Windows PowerShell automation with visual action flows, CLI utilities, and scheduled tasks.",
    windowsOnlyNote: "Windows only · v1 targets Windows 10/11",
  },
  nav: {
    home: "Home",
    gettingStarted: "Getting Started",
    desktopUi: "Desktop UI",
    actionSteps: "Action Steps",
    predefinedCommands: "Pre-defined Commands",
    configuration: "Configuration & CLI",
  },
  common: {
    copy: "Copy",
    copied: "Copied",
    comingSoon: "Coming soon",
    downloadWindows: "Download for Windows",
    viewOnGitHub: "View on GitHub",
    browseActionSteps: "Browse action steps",
    gettingStarted: "Getting started",
    param: "Param",
    type: "Type",
    required: "Required",
    interpolation: "Interpolation",
    description: "Description",
    example: "Example",
    notes: "Notes",
    yes: "Yes",
    no: "No",
    optional: "Optional",
    conditional: "Conditional",
    screenshotPlaceholder: "Screenshot coming soon — add PNG to page/public/screenshots/",
    categoryBrowser: "Browser",
    categoryTiming: "Timing",
    categoryData: "Data & I/O",
    categoryControlFlow: "Control flow",
  },
  home: {
    tag: "ShellForge",
    title: "Build, run, and schedule Windows automation.",
    subtitle:
      "A desktop manager and CLI toolkit for PowerShell workflows — browser automation, HTTP requests, shell commands, and 20 pre-defined utilities.",
    versionBadge: "Windows desktop app",
    valuePropsTitle: "Why use ShellForge?",
    valueProp1: "Visual flow editor for multi-step automations (browser + API + shell)",
    valueProp2: "20 pre-defined CLI commands with Unix-style parity on Windows",
    valueProp3: "Managed $PROFILE block — enable commands without hand-editing aliases",
    valueProp4: "Scheduled tasks via Windows Task Scheduler",
    valueProp5: "Persistent browser profiles for login-heavy web apps",
    examplesTitle: "Example workflows",
    exampleLoginTitle: "Multi-step browser login",
    exampleApiTitle: "API fetch and save to file",
  },
  gettingStarted: {
    title: "Getting Started",
    subtitle: "Install ShellForge and run your first automation on Windows.",
    requirementsTitle: "System requirements",
    requirementsBody: "Windows 10 or 11 with PowerShell 5.1 or later. No separate Node.js install is required for the desktop app.",
    installTitle: "Download and install",
    installBody:
      "Run the ShellForge installer or portable executable. On first launch, the app opens on the Pre-defined Commands tab.",
    installSizeTitle: "Installer size",
    installSizeBody:
      "The Windows installer is large (often around 800 MB) because it bundles Electron, Node.js, Puppeteer, and Chromium for browser automation. After installation, user data in AppData stays much smaller: config, scheduled tasks, and browser profiles only. Command files and runtime dependencies remain in the install folder.",
    firstLaunchTitle: "First launch",
    firstLaunchBody:
      "The desktop manager has three tabs: Pre-defined Commands, Custom Actions, and Scheduled Tasks. Use the header search to filter rows in any tab.",
    enableCommandTitle: "Enable your first command",
    enableCommandBody:
      "Toggle a pre-defined command ON. ShellForge writes a managed block to your PowerShell $PROFILE. Run reinitialize in the terminal to reload aliases.",
    cliTitle: "Run Action Runner from CLI",
    cliBody: "After enabling action-runner and creating a custom action, run:",
    argsTitle: "Pass arguments",
    argsBody: "Custom arguments flow into the action context via getArguments steps:",
    filesTitle: "Where files live",
    filesBody:
      "config/config.json (custom actions), scheduled-tasks/*.ps1 (schedules), .shellforge-browser-profiles/ (persistent browser sessions).",
    troubleshootingTitle: "Troubleshooting",
    troubleshootingItems: [
      "Command not found — toggle the command ON in the app, then run reinitialize.",
      "Profile changes ignored — close and reopen the terminal or run reinitialize.",
      "Browser step fails — check browserProfile or run navigate before setWebStorage.",
    ],
  },
  desktopUi: {
    title: "Desktop UI",
    subtitle: "Tour of the ShellForge Electron manager.",
    intro:
      "ShellForge ships as a desktop app with fixed chrome (header, tab bar, footer) and scrollable tab content. Theme follows OS preference and persists your choice.",
    predefinedTitle: "Pre-defined Commands tab",
    predefinedBody:
      "Twenty commands grouped by category (Core, Shell lifecycle, Unix parity, Windows utilities). Filter with category chips, customize aliases, and toggle commands ON/OFF. Toggles update the managed $PROFILE block.",
    customTitle: "Custom Actions tab",
    customBody:
      "Create and edit multi-step flows in a React Flow canvas. The step detail panel edits fields with hints and interpolation support. Set browserProfile per action, validate flows, run actions from the UI, and expose actions on CLI with availableOnCLI.",
    scheduledTitle: "Scheduled Tasks tab",
    scheduledBody:
      "Create schedules with task name, command (custom action alias), trigger times, and weekdays. Toggle ON registers the Windows scheduled task; toggle OFF runs the script with -Remove.",
    footerNote: "Footer includes theme toggle and external links. Edit modals auto-save after 10 seconds without changes.",
  },
  actionSteps: {
    title: "Action Steps",
    subtitle: "Complete reference for every step type and parameter.",
    introInterpolation:
      "String fields support {{context.path}} (values from earlier steps) and {{env.VARIABLE_NAME}} (environment variables).",
    introNested:
      "Nested step arrays: steps (forEach, forEachElement), try/catch/finally (tryCatch), then/else (ifElse).",
    introBrowserProfile:
      "Optional action-level browserProfile persists cookies under .shellforge-browser-profiles/<name>/ via Puppeteer userDataDir.",
    workflowsTitle: "Example composed workflows",
    steps: {
      navigate: { summary: "Open a URL in the browser.", notes: "Use waitForLoading when the page shows loading overlays." },
      type: { summary: "Type text into an input matched by CSS selector." },
      click: { summary: "Click an element. Supports waiting for navigation, selectors, and JS click fallback." },
      wait: { summary: "Pause execution for a fixed duration. No browser required." },
      waitForPageState: {
        summary: "Wait until a selector is visible, URL contains text, or loading finishes.",
        notes: "Requires an active browser page.",
      },
      setWebStorage: {
        summary: "Inject localStorage, sessionStorage, or cookies.",
        notes: "Run after navigate to the target domain; reload with another navigate to apply session.",
      },
      closeBrowser: { summary: "Close the Puppeteer browser instance." },
      forEachElement: {
        summary: "Iterate DOM elements and run sub-steps for each match.",
        notes: "Sub-steps: browser actions plus wait and apiRequest.",
      },
      forEach: {
        summary: "Iterate a JSON list or repeat a fixed count.",
        notes: "Use {{context.item}} and {{context.index}} inside sub-steps.",
      },
      apiRequest: {
        summary: "HTTP request with optional response stored as { status, headers, body }.",
      },
      setVariable: { summary: "Store a resolved value into runtime context." },
      shell: {
        summary: "Run PowerShell (default) or custom shell commands.",
        notes: "storeAs shape: { stdout, stderr, exitCode }.",
      },
      getArguments: { summary: "Map CLI or parent args into context with required/optional/defaults." },
      invokeAction: {
        summary: "Call another action by name with isolated child context.",
        notes: "Recursion capped at 5 levels.",
      },
      tryCatch: {
        summary: "Run try steps; on failure set context.errorMessage and run catch/finally.",
      },
      ifElse: {
        summary: "Compare context/env values and run then or else branches.",
        notes: "Operators: eq, gt, gte, lt, lte, exists.",
      },
      writeFile: { summary: "Write text content to a file path with optional backup." },
    },
    fieldHints: {
      url: "Full URL to navigate to",
      waitForLoading: "Wait for loading overlays to disappear",
      selector: "CSS selector",
      value: "Text to type — supports interpolation",
      delay: "Milliseconds between keystrokes",
      iframe: "iframe containing the target element",
      waitForSelector: "Wait until this selector is visible",
      waitForNavigation: "Wait for page navigation after click",
      timeout: "Max wait time in milliseconds",
      jsClick: "Click via JavaScript instead of simulated mouse",
      ms: "Pause duration in milliseconds",
      urlContains: "Wait until current URL contains substring",
      localStorage: "Key-value pairs for localStorage",
      sessionStorage: "Key-value pairs for sessionStorage",
      cookies: "Puppeteer cookie object array",
      list: "JSON array to iterate — {{context.item}} per entry",
      count: "Number of repetitions",
      method: "HTTP verb",
      params: "Query-string parameters",
      headers: "HTTP request headers",
      auth: "Basic auth: username and password keys",
      body: "JSON request body",
      storeAs: "Context variable name to store result",
      ignoreHttpErrors: "Continue on 4xx/5xx responses",
      source: "Value to store — supports interpolation",
      command: "Single shell command",
      commands: "Shell commands run in sequence",
      shellArgs: "Extra arguments for shell binary",
      cwd: "Working directory",
      shell: "Shell executable (default powershell.exe)",
      ignoreExitCode: "Continue when exit code is non-zero",
      maxBuffer: "Max stdout/stderr buffer in bytes",
      required: "Required argument names",
      optional: "Optional argument names",
      defaults: "Fallback values for optional args",
      name: "Action name to invoke",
      args: "Arguments passed to child action",
      continueOnError: "Keep parent running if child fails",
      path: "Absolute file path",
      content: "File content — supports interpolation",
      backupIfExists: "Rename existing file with timestamp before overwrite",
      textContentSelector: "Sub-selector to read text within each element",
      excludeTextPatterns: "Skip elements whose text matches patterns",
      clickSelector: "Sub-selector to click within each element",
      skipIfPositionMatch: "Skip element when bounding-box matches",
      left: "Left operand — single {{context.*}} or {{env.*}} placeholder",
      operator: "Comparison operator",
      right: "Right operand (not required for exists)",
      try: "Steps to attempt",
      catch: "Steps when try throws",
      finally: "Steps that always run",
      then: "Steps when condition is true",
      else: "Steps when condition is false",
      browserProfile: "Profile key for persistent browser session",
    },
    actionLevelTitle: "Action-level settings",
    actionLevelBody:
      "browserProfile on an action config resolves to .shellforge-browser-profiles/<name>/ and is passed to Puppeteer as userDataDir.",
  },
  predefined: {
    title: "Pre-defined Commands",
    subtitle: "Twenty CLI utilities shipped with ShellForge. Enable them in the desktop UI or via $PROFILE aliases.",
    usageLabel: "Example usage",
  },
  configuration: {
    title: "Configuration & CLI",
    subtitle: "Developer reference for config files, interpolation, and CLI usage.",
    configTitle: "config.json structure",
    configBody:
      "actionRunner holds custom actions (steps arrays). ui.customActions stores CLI availability and aliases. scheduler holds optional scheduler settings.",
    interpolationTitle: "Interpolation",
    interpolationBody:
      "{{context.some.path}} reads runtime context. {{env.VARIABLE_NAME}} reads environment variables. All step string fields support interpolation unless noted.",
    profilesTitle: "Browser profiles",
    profilesBody:
      "Profiles persist under .shellforge-browser-profiles/<key>/. Prefer profiles over hardcoded tokens for apps that rotate sessions.",
    cliTitle: "action-runner CLI",
    profileBlockTitle: "Managed $PROFILE block",
    profileBlockBody:
      "ShellForge writes between # === shellforge:BEGIN (managed - do not edit) === and # === shellforge:END ===. Content outside the block is preserved.",
    scheduledTitle: "Scheduled tasks",
    scheduledBody:
      "Scripts in scheduled-tasks/ use Register-ScheduledTask. Copy the example, set task name, trigger times, weekdays, and command. Run elevated once to register.",
    devTitle: "Develop from source",
    devBody: "Clone the repository, run npm install, then npm run ui:dev for the desktop app or npm run page:dev for this site.",
    cliRows: [
      { param: "--action / -a", required: "Yes", description: "Action name from config.actionRunner" },
      { param: "--verbose / -v", required: "No", description: "Print execution logs" },
      { param: "--arg.<name>=value", required: "No", description: "Pass custom argument into action context" },
    ],
  },
  categories: {
    core: "Core",
    shellLifecycle: "Shell lifecycle",
    unixParity: "Unix parity",
    windowsUtilities: "Windows utilities",
  },
  commands: {
    "action-runner": {
      description: "Runs custom action flows configured in the Custom Actions tab.",
      usage: "action-runner --action=my-action -v",
    },
    reinitialize: {
      description: "Reloads the PowerShell profile in the current terminal session.",
      usage: "reinitialize",
    },
    "reload-env": {
      description: "Refreshes PATH and common environment variables in the current session.",
      usage: "reload-env",
    },
    profile: {
      description: "Opens the PowerShell profile file in your preferred editor.",
      usage: "profile",
    },
    touch: {
      description: "Creates a new file or updates the modification time of an existing file.",
      usage: "touch file.txt",
    },
    which: {
      description: "Prints the resolved path of an executable command.",
      usage: "which git",
    },
    mkdirp: {
      description: "Creates nested directories, including parent paths as needed.",
      usage: "mkdirp path/to/nested/dir",
    },
    open: {
      description: "Opens files, folders, or URLs with the default application.",
      usage: "open https://example.com",
    },
    pbcopy: {
      description: "Copies stdin or file contents to the clipboard.",
      usage: "echo hello | pbcopy",
    },
    pbpaste: {
      description: "Prints clipboard contents to stdout.",
      usage: "pbpaste",
    },
    realpath: {
      description: "Resolves a path to its canonical absolute form.",
      usage: "realpath .\\relative\\path",
    },
    uuid: {
      description: "Generates and prints a new UUID.",
      usage: "uuid",
    },
    head: {
      description: "Prints the first lines of a file.",
      usage: "head file.txt -n 10",
    },
    tail: {
      description: "Prints the last lines of a file.",
      usage: "tail file.txt -n 20",
    },
    watch: {
      description:
        "Repeatedly runs a command at a fixed interval. ShellForge profile commands such as uuid work here.",
      usage: "watch uuid",
    },
    "git-root": {
      description: "Finds the root directory of the current Git repository.",
      usage: "git-root --cd",
    },
    "kill-port": {
      description: "Stops the process listening on a TCP port.",
      usage: "kill-port 3000 -f",
    },
    "as-admin": {
      description: "Runs a command with administrator privileges.",
      usage: "as-admin powershell",
    },
    hidden: {
      description:
        "Runs a command in a hidden PowerShell window. Output stays in that hidden window, not your current terminal.",
      usage: "hidden my-background-task.ps1",
    },
  },
};
