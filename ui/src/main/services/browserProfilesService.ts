import fs from "node:fs";
import path from "node:path";
import type { ActionConfig, AppConfig } from "../../shared/types";
import { getRepoPaths } from "./repoPaths";

const PROFILE_BASE_DIRECTORY = ".shellforge-browser-profiles";

function readBrowserProfileFromActionConfig(actionConfig: ActionConfig): string | null {
  const browserProfile = actionConfig.browserProfile;
  if (typeof browserProfile !== "string") {
    return null;
  }
  const trimmedProfile = browserProfile.trim();
  return trimmedProfile.length > 0 ? trimmedProfile : null;
}

function collectProfileKeysFromConfig(config: AppConfig): string[] {
  const profileKeys = new Set<string>();
  Object.values(config.actionRunner).forEach((actionConfig) => {
    const profileKey = readBrowserProfileFromActionConfig(actionConfig);
    if (profileKey) {
      profileKeys.add(profileKey);
    }
  });
  return Array.from(profileKeys);
}

function collectProfileKeysFromFilesystem(repoRoot: string): string[] {
  const profilesDirectoryPath = path.join(repoRoot, PROFILE_BASE_DIRECTORY);
  if (!fs.existsSync(profilesDirectoryPath)) {
    return [];
  }

  return fs
    .readdirSync(profilesDirectoryPath, { withFileTypes: true })
    .filter((directoryEntry) => directoryEntry.isDirectory())
    .map((directoryEntry) => directoryEntry.name)
    .filter((profileKey) => profileKey.trim().length > 0);
}

export function listBrowserProfileKeys(config: AppConfig): string[] {
  const { userDataRoot } = getRepoPaths();
  const profileKeys = new Set<string>([
    ...collectProfileKeysFromFilesystem(userDataRoot),
    ...collectProfileKeysFromConfig(config),
  ]);
  return Array.from(profileKeys).sort((leftKey, rightKey) => leftKey.localeCompare(rightKey));
}
