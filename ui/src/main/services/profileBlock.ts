import fs from "node:fs";
import path from "node:path";
import type { AppConfig, ProfileStatus } from "../../shared/types";
import {
  assertProfileWritableForRegeneration,
  getProfileHealthStatus,
} from "./profileHealth";
import {
  buildProfileBlock,
  mergeManagedBlock,
} from "./profileBlockCore";
import { getProfilePath } from "./profilePath";
import { resolvePredefinedCommandExecutablePaths } from "./repoPaths";

let hasBackedUpProfileInSession = false;

function readProfileContent(profilePath: string): string {
  if (!fs.existsSync(profilePath)) {
    return "";
  }

  return fs.readFileSync(profilePath, "utf8");
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
  return getProfileHealthStatus();
}

export function regenerateProfileManagedBlock(config: AppConfig): void {
  const profileStatus = getProfileHealthStatus();
  assertProfileWritableForRegeneration(profileStatus);

  const profilePath = getProfilePath();
  const profileDirectory = path.dirname(profilePath);
  const profileContent = readProfileContent(profilePath);
  const managedBlock = buildProfileBlock(config, resolvePredefinedCommandExecutablePaths());

  if (!fs.existsSync(profileDirectory)) {
    fs.mkdirSync(profileDirectory, { recursive: true });
  }

  backupProfileIfNeeded(profilePath);

  try {
    const updatedProfile = mergeManagedBlock(profileContent, managedBlock);
    fs.writeFileSync(profilePath, updatedProfile, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to write PowerShell profile.";
    throw new Error(message);
  }
}

export { getProfilePath } from "./profilePath";
