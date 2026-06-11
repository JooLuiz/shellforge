import { app } from "electron";
import fs from "node:fs";
import path from "node:path";
import {
  PACKAGED_RUNTIME_RESOURCE_DIR,
  SHELLFORGE_RUNTIME_VERSION_FILE,
  USER_DATA_REPO_DIR_NAME,
} from "./shellforgeRuntimeLayout";

export function getPackagedRuntimePath(): string {
  return path.join(process.resourcesPath, PACKAGED_RUNTIME_RESOURCE_DIR);
}

export function getUserDataRepoRoot(): string {
  return path.join(app.getPath("userData"), USER_DATA_REPO_DIR_NAME);
}

function readRuntimeVersion(runtimeRoot: string): string | null {
  const versionFilePath = path.join(runtimeRoot, SHELLFORGE_RUNTIME_VERSION_FILE);
  if (!fs.existsSync(versionFilePath)) {
    return null;
  }

  return fs.readFileSync(versionFilePath, "utf8").trim();
}

function writeInstalledRuntimeVersion(userDataRepoRoot: string, bundledVersion: string): void {
  fs.writeFileSync(
    path.join(userDataRepoRoot, SHELLFORGE_RUNTIME_VERSION_FILE),
    `${bundledVersion}\n`,
    "utf8",
  );
}

function ensureUserWritableLayout(userDataRepoRoot: string, bundledRuntimeRoot: string): void {
  const configDirectoryPath = path.join(userDataRepoRoot, "config");
  const configPath = path.join(configDirectoryPath, "config.json");
  const bundledConfigExamplePath = path.join(bundledRuntimeRoot, "config", "config-example.json");
  const userConfigExamplePath = path.join(configDirectoryPath, "config-example.json");

  fs.mkdirSync(configDirectoryPath, { recursive: true });

  if (fs.existsSync(bundledConfigExamplePath) && !fs.existsSync(userConfigExamplePath)) {
    fs.copyFileSync(bundledConfigExamplePath, userConfigExamplePath);
  }

  if (!fs.existsSync(configPath)) {
    const configExamplePath = fs.existsSync(userConfigExamplePath)
      ? userConfigExamplePath
      : bundledConfigExamplePath;

    if (fs.existsSync(configExamplePath)) {
      fs.copyFileSync(configExamplePath, configPath);
    }
  }

  fs.mkdirSync(path.join(userDataRepoRoot, "scheduled-tasks"), { recursive: true });
  fs.mkdirSync(path.join(userDataRepoRoot, ".shellforge-browser-profiles"), { recursive: true });
}

export function ensurePackagedUserData(): void {
  if (!app.isPackaged) {
    return;
  }

  const bundledRuntimeRoot = getPackagedRuntimePath();
  const userDataRepoRoot = getUserDataRepoRoot();

  if (!fs.existsSync(bundledRuntimeRoot)) {
    throw new Error(
      `Packaged runtime files were not found at "${bundledRuntimeRoot}". Reinstall ShellForge.`,
    );
  }

  fs.mkdirSync(userDataRepoRoot, { recursive: true });
  ensureUserWritableLayout(userDataRepoRoot, bundledRuntimeRoot);

  const bundledVersion = readRuntimeVersion(bundledRuntimeRoot);
  const installedVersion = readRuntimeVersion(userDataRepoRoot);

  if (bundledVersion && bundledVersion !== installedVersion) {
    writeInstalledRuntimeVersion(userDataRepoRoot, bundledVersion);
  }
}
