import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { AppConfig, ProfileStatus } from "../../shared/types";
import {
  buildProfileBlock,
  findManagedBlock,
  mergeManagedBlock,
  type CommandExecutablePaths,
} from "./profileBlockCore";
import { getRepoPaths } from "./repoPaths";

let hasBackedUpProfileInSession = false;

function getProfilePath(): string {
  const profilePath = execFileSync(
    "powershell",
    ["-NoProfile", "-Command", "$PROFILE.CurrentUserCurrentHost"],
    {
      encoding: "utf8",
    }
  ).trim();

  if (!profilePath) {
    throw new Error("Unable to resolve $PROFILE.CurrentUserCurrentHost");
  }

  return profilePath;
}

function readProfileContent(profilePath: string): string {
  if (!fs.existsSync(profilePath)) {
    return "";
  }

  return fs.readFileSync(profilePath, "utf8");
}

function resolveCommandExecutablePaths(): CommandExecutablePaths {
  return {
    reinitialize: getRepoPaths().reinitializeBatPath,
    touch: getRepoPaths().touchBatPath,
    "action-runner": getRepoPaths().actionRunnerBatPath,
  };
}

function backupProfileIfNeeded(profilePath: string): void {
  if (hasBackedUpProfileInSession || !fs.existsSync(profilePath)) {
    return;
  }

  const directoryName = path.dirname(profilePath);
  const fileName = path.basename(profilePath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(directoryName, `${fileName}.bak-${timestamp}`);
  fs.copyFileSync(profilePath, backupPath);
  hasBackedUpProfileInSession = true;
}

export function getProfileStatus(): ProfileStatus {
  const profilePath = getProfilePath();
  const profileContent = readProfileContent(profilePath);
  const block = findManagedBlock(profileContent);
  return {
    profilePath,
    blockPresent: Boolean(block),
  };
}

export function regenerateProfileManagedBlock(config: AppConfig): void {
  const profilePath = getProfilePath();
  const profileDirectory = path.dirname(profilePath);
  const profileContent = readProfileContent(profilePath);
  const managedBlock = buildProfileBlock(config, resolveCommandExecutablePaths());

  if (!fs.existsSync(profileDirectory)) {
    fs.mkdirSync(profileDirectory, { recursive: true });
  }

  backupProfileIfNeeded(profilePath);

  const updatedProfile = mergeManagedBlock(profileContent, managedBlock);
  fs.writeFileSync(profilePath, updatedProfile, "utf8");
}
