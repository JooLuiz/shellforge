import { PREDEFINED_COMMAND_DEFINITIONS } from "../../shared/predefinedCommandsRegistry";

export const PACKAGED_RUNTIME_RESOURCE_DIR = "shellforge-runtime";
export const SHELLFORGE_APP_DATA_DIR_NAME = "ShellForge";
export const USER_DATA_REPO_DIR_NAME = "shellforge-data";
export const SHELLFORGE_RUNTIME_VERSION_FILE = "SHELLFORGE_RUNTIME_VERSION";

export const SHELLFORGE_READ_ONLY_RUNTIME_DIRS: readonly string[] = [
  "commands",
  "command-lib",
  "utils",
];

export const SHELLFORGE_HEAVY_RUNTIME_DIRS: readonly string[] = ["node_modules", "nodejs"];

export const SHELLFORGE_SYNCED_RUNTIME_DIRS: readonly string[] = [
  ...SHELLFORGE_READ_ONLY_RUNTIME_DIRS,
  ...SHELLFORGE_HEAVY_RUNTIME_DIRS,
];

export const SHELLFORGE_PREDEFINED_COMMAND_FOLDERS: readonly string[] = Array.from(
  new Set(PREDEFINED_COMMAND_DEFINITIONS.map((definition) => definition.folderName)),
);
