import { app } from "electron";
import fs from "node:fs";
import path from "node:path";

interface RepoPaths {
  repoRoot: string;
  configPath: string;
  scheduledTasksDir: string;
  touchBatPath: string;
  reinitializeBatPath: string;
  actionRunnerBatPath: string;
}

let cachedRepoPaths: RepoPaths | null = null;

function hasRepoShape(repoRoot: string): boolean {
  const configPath = path.join(repoRoot, "config", "config.json");
  const scheduledTasksPath = path.join(repoRoot, "scheduled-tasks");
  return fs.existsSync(configPath) && fs.existsSync(scheduledTasksPath);
}

function resolveRepoRoot(): string {
  const envRepoRoot = process.env.WCC_REPO_ROOT;
  if (envRepoRoot && hasRepoShape(envRepoRoot)) {
    return envRepoRoot;
  }

  const appPath = app.getAppPath();
  const appCandidate = path.resolve(appPath, "..");
  if (hasRepoShape(appCandidate)) {
    return appCandidate;
  }

  const workingDirectory = process.cwd();
  if (hasRepoShape(workingDirectory)) {
    return workingDirectory;
  }

  const parentWorkingDirectory = path.resolve(workingDirectory, "..");
  if (hasRepoShape(parentWorkingDirectory)) {
    return parentWorkingDirectory;
  }

  throw new Error(
    "Unable to resolve project root. Set WCC_REPO_ROOT to the windows-custom-commands repository path."
  );
}

export function getRepoPaths(): RepoPaths {
  if (cachedRepoPaths) {
    return cachedRepoPaths;
  }

  const repoRoot = resolveRepoRoot();
  cachedRepoPaths = {
    repoRoot,
    configPath: path.join(repoRoot, "config", "config.json"),
    scheduledTasksDir: path.join(repoRoot, "scheduled-tasks"),
    touchBatPath: path.join(repoRoot, "touch", "touch.bat"),
    reinitializeBatPath: path.join(repoRoot, "reinitialize", "reinitialize.bat"),
    actionRunnerBatPath: path.join(repoRoot, "action-runner", "action-runner.bat"),
  };

  return cachedRepoPaths;
}
