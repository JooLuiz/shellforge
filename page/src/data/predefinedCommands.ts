export type PredefinedCommandCategory =
  | "core"
  | "shell-lifecycle"
  | "unix-parity"
  | "windows-utilities";

export interface PredefinedCommandEntry {
  key: string;
  category: PredefinedCommandCategory;
}

/** Mirror of ui/src/shared/predefinedCommandsRegistry.ts */
export const PREDEFINED_COMMANDS: PredefinedCommandEntry[] = [
  { key: "action-runner", category: "core" },
  { key: "reinitialize", category: "shell-lifecycle" },
  { key: "reload-env", category: "shell-lifecycle" },
  { key: "profile", category: "shell-lifecycle" },
  { key: "touch", category: "unix-parity" },
  { key: "which", category: "unix-parity" },
  { key: "mkdirp", category: "unix-parity" },
  { key: "open", category: "unix-parity" },
  { key: "pbcopy", category: "unix-parity" },
  { key: "pbpaste", category: "unix-parity" },
  { key: "realpath", category: "unix-parity" },
  { key: "uuid", category: "unix-parity" },
  { key: "head", category: "unix-parity" },
  { key: "tail", category: "unix-parity" },
  { key: "watch", category: "unix-parity" },
  { key: "git-root", category: "unix-parity" },
  { key: "kill-port", category: "windows-utilities" },
  { key: "as-admin", category: "windows-utilities" },
  { key: "hidden", category: "windows-utilities" },
];

export const PREDEFINED_CATEGORY_ORDER: PredefinedCommandCategory[] = [
  "core",
  "shell-lifecycle",
  "unix-parity",
  "windows-utilities",
];
