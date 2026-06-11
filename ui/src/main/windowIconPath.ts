import { app } from "electron";
import fs from "node:fs";
import path from "node:path";

function resolvePlatformIconFileName(): string | undefined {
  if (process.platform === "win32") {
    return "shell-forge-mark.ico";
  }

  if (process.platform === "linux") {
    return "shell-forge-mark.png";
  }

  return undefined;
}

function findExistingIconPath(candidates: string[]): string | undefined {
  return candidates.find((candidatePath) => fs.existsSync(candidatePath));
}

export function resolveWindowIconPath(): string | undefined {
  const iconFileName = resolvePlatformIconFileName();
  if (!iconFileName) {
    return undefined;
  }

  const iconCandidates = [
    path.join(app.getAppPath(), "resources", "icons", iconFileName),
    path.join(__dirname, "../resources/icons", iconFileName),
  ];

  return findExistingIconPath(iconCandidates);
}
