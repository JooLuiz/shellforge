export type PredefinedCommandCategory =
  | "core"
  | "shell-lifecycle"
  | "unix-parity"
  | "windows-utilities";

export interface PredefinedCommandDefinition {
  key: PredefinedCommandKey;
  label: string;
  description: string;
  category: PredefinedCommandCategory;
  folderName: string;
}

export type PredefinedCommandKey =
  | "action-runner"
  | "reinitialize"
  | "reload-env"
  | "profile"
  | "touch"
  | "which"
  | "mkdirp"
  | "open"
  | "pbcopy"
  | "pbpaste"
  | "realpath"
  | "uuid"
  | "head"
  | "tail"
  | "watch"
  | "git-root"
  | "kill-port"
  | "as-admin"
  | "hidden";

export const PREDEFINED_COMMAND_CATEGORY_LABELS: Record<PredefinedCommandCategory, string> = {
  core: "Core",
  "shell-lifecycle": "Shell lifecycle",
  "unix-parity": "Unix parity",
  "windows-utilities": "Windows utilities",
};

export const PREDEFINED_COMMAND_DEFINITIONS: readonly PredefinedCommandDefinition[] = [
  {
    key: "action-runner",
    label: "Action Runner",
    description: "Runs custom action flows configured in the Custom Actions tab.",
    category: "core",
    folderName: "action-runner",
  },
  {
    key: "reinitialize",
    label: "Reinitialize",
    description: "Reloads the PowerShell profile in the current terminal session.",
    category: "shell-lifecycle",
    folderName: "reinitialize",
  },
  {
    key: "reload-env",
    label: "Reload Env",
    description: "Refreshes PATH and common environment variables in the current session.",
    category: "shell-lifecycle",
    folderName: "reload-env",
  },
  {
    key: "profile",
    label: "Profile",
    description: "Opens the PowerShell profile file in your preferred editor.",
    category: "shell-lifecycle",
    folderName: "profile",
  },
  {
    key: "touch",
    label: "Touch",
    description: "Creates a new file or updates the modification time of an existing file.",
    category: "unix-parity",
    folderName: "touch",
  },
  {
    key: "which",
    label: "Which",
    description: "Prints the resolved path of an executable command.",
    category: "unix-parity",
    folderName: "which",
  },
  {
    key: "mkdirp",
    label: "Mkdirp",
    description: "Creates nested directories, including parent paths as needed.",
    category: "unix-parity",
    folderName: "mkdirp",
  },
  {
    key: "open",
    label: "Open",
    description: "Opens files, folders, or URLs with the default application.",
    category: "unix-parity",
    folderName: "open",
  },
  {
    key: "pbcopy",
    label: "Pbcopy",
    description: "Copies stdin or file contents to the clipboard.",
    category: "unix-parity",
    folderName: "pbcopy",
  },
  {
    key: "pbpaste",
    label: "Pbpaste",
    description: "Prints clipboard contents to stdout.",
    category: "unix-parity",
    folderName: "pbpaste",
  },
  {
    key: "realpath",
    label: "Realpath",
    description: "Resolves a path to its canonical absolute form.",
    category: "unix-parity",
    folderName: "realpath",
  },
  {
    key: "uuid",
    label: "Uuid",
    description: "Generates and prints a new UUID.",
    category: "unix-parity",
    folderName: "uuid",
  },
  {
    key: "head",
    label: "Head",
    description: "Prints the first lines of a file.",
    category: "unix-parity",
    folderName: "head",
  },
  {
    key: "tail",
    label: "Tail",
    description: "Prints the last lines of a file.",
    category: "unix-parity",
    folderName: "tail",
  },
  {
    key: "watch",
    label: "Watch",
    description:
      "Repeatedly runs a command at a fixed interval. Works with ShellForge profile commands such as uuid.",
    category: "unix-parity",
    folderName: "watch",
  },
  {
    key: "git-root",
    label: "Git Root",
    description: "Finds the root directory of the current Git repository.",
    category: "unix-parity",
    folderName: "git-root",
  },
  {
    key: "kill-port",
    label: "Kill Port",
    description: "Stops the process listening on a TCP port.",
    category: "windows-utilities",
    folderName: "kill-port",
  },
  {
    key: "as-admin",
    label: "As Admin",
    description: "Runs a command with administrator privileges.",
    category: "windows-utilities",
    folderName: "as-admin",
  },
  {
    key: "hidden",
    label: "Hidden",
    description:
      "Runs a command in a hidden PowerShell window. Console output is not shown in your current terminal.",
    category: "windows-utilities",
    folderName: "hidden",
  },
] as const;

export const PREDEFINED_COMMAND_KEYS: PredefinedCommandKey[] =
  PREDEFINED_COMMAND_DEFINITIONS.map((definition) => definition.key);

export function getPredefinedCommandDefinition(
  commandKey: PredefinedCommandKey
): PredefinedCommandDefinition {
  const definition = PREDEFINED_COMMAND_DEFINITIONS.find(
    (candidate) => candidate.key === commandKey
  );
  if (!definition) {
    throw new Error(`Unknown predefined command key: ${commandKey}`);
  }
  return definition;
}

export function getPredefinedCommandBatPath(
  repoRoot: string,
  commandKey: PredefinedCommandKey
): string {
  const { folderName } = getPredefinedCommandDefinition(commandKey);
  const normalizedRepoRoot = repoRoot.replace(/[/\\]+$/, "");
  return `${normalizedRepoRoot}\\commands\\${folderName}\\${commandKey}.bat`;
}

export function buildPredefinedCommandExecutablePaths(
  repoRoot: string
): Record<PredefinedCommandKey, string> {
  return PREDEFINED_COMMAND_KEYS.reduce(
    (accumulator, commandKey) => ({
      ...accumulator,
      [commandKey]: getPredefinedCommandBatPath(repoRoot, commandKey),
    }),
    {} as Record<PredefinedCommandKey, string>
  );
}
