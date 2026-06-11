import { app } from "electron";
import fs from "node:fs";
import path from "node:path";
import {
  buildPredefinedCommandExecutablePaths,
  getPredefinedCommandBatPath,
  type PredefinedCommandKey,
} from "../../shared/predefinedCommandsRegistry";
import { getPackagedRuntimePath, getUserDataRepoRoot } from "./packagedDataBootstrap";

export interface RepoPaths {
  userDataRoot: string;
  runtimeRoot: string;
  configPath: string;
  scheduledTasksDir: string;
}

let cachedRepoPaths: RepoPaths | null = null;

function hasUserDataShape(userDataRoot: string): boolean {
  const configPath = path.join(userDataRoot, "config", "config.json");
  const scheduledTasksPath = path.join(userDataRoot, "scheduled-tasks");
  return fs.existsSync(configPath) && fs.existsSync(scheduledTasksPath);
}

function resolveDevRepoRoot(): string {
  const envRepoRoot = process.env.SHELLFORGE_REPO_ROOT;
  if (envRepoRoot && hasUserDataShape(envRepoRoot)) {
    return envRepoRoot;
  }

  const appPath = app.getAppPath();
  const appCandidate = path.resolve(appPath, "..");
  if (hasUserDataShape(appCandidate)) {
    return appCandidate;
  }

  const workingDirectory = process.cwd();
  if (hasUserDataShape(workingDirectory)) {
    return workingDirectory;
  }

  const parentWorkingDirectory = path.resolve(workingDirectory, "..");
  if (hasUserDataShape(parentWorkingDirectory)) {
    return parentWorkingDirectory;
  }

  throw new Error(
    "Unable to resolve project root. Set SHELLFORGE_REPO_ROOT to the ShellForge repository path.",
  );
}

function resolveRepoRoots(): Pick<RepoPaths, "userDataRoot" | "runtimeRoot"> {
  if (app.isPackaged) {
    return {
      userDataRoot: getUserDataRepoRoot(),
      runtimeRoot: getPackagedRuntimePath(),
    };
  }

  const repoRoot = resolveDevRepoRoot();
  return {
    userDataRoot: repoRoot,
    runtimeRoot: repoRoot,
  };
}

export function getRepoPaths(): RepoPaths {
  if (cachedRepoPaths) {
    return cachedRepoPaths;
  }

  const { userDataRoot, runtimeRoot } = resolveRepoRoots();
  cachedRepoPaths = {
    userDataRoot,
    runtimeRoot,
    configPath: path.join(userDataRoot, "config", "config.json"),
    scheduledTasksDir: path.join(userDataRoot, "scheduled-tasks"),
  };

  return cachedRepoPaths;
}

export function resolvePredefinedCommandBatPath(commandKey: PredefinedCommandKey): string {
  return getPredefinedCommandBatPath(getRepoPaths().runtimeRoot, commandKey);
}

export function resolvePredefinedCommandExecutablePaths(): Record<PredefinedCommandKey, string> {
  return buildPredefinedCommandExecutablePaths(getRepoPaths().runtimeRoot);
}

export function resetRepoPathsCacheForTests(): void {
  cachedRepoPaths = null;
}
