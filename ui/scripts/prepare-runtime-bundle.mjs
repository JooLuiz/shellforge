import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SHELLFORGE_READ_ONLY_RUNTIME_FOLDERS } from "./shellforgeRuntimeFolders.mjs";
import { downloadNodeRuntime } from "./download-node-runtime.mjs";

const uiRootPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRootPath = path.resolve(uiRootPath, "..");
const bundleRootPath = path.join(uiRootPath, "runtime-bundle");
const uiPackageJsonPath = path.join(uiRootPath, "package.json");

function copyPath(sourcePath, destinationPath) {
  fs.cpSync(sourcePath, destinationPath, { recursive: true });
}

async function prepareRuntimeBundle() {
  const uiPackageJson = JSON.parse(fs.readFileSync(uiPackageJsonPath, "utf8"));
  const runtimeVersion = uiPackageJson.version;

  fs.rmSync(bundleRootPath, { recursive: true, force: true });
  fs.mkdirSync(bundleRootPath, { recursive: true });

  SHELLFORGE_READ_ONLY_RUNTIME_FOLDERS.forEach((folderName) => {
    const sourceFolderPath = path.join(repoRootPath, folderName);
    if (!fs.existsSync(sourceFolderPath)) {
      throw new Error(`Missing runtime folder: ${sourceFolderPath}`);
    }

    copyPath(sourceFolderPath, path.join(bundleRootPath, folderName));
  });

  const configDirectoryPath = path.join(bundleRootPath, "config");
  fs.mkdirSync(configDirectoryPath, { recursive: true });
  copyPath(
    path.join(repoRootPath, "config", "config-example.json"),
    path.join(configDirectoryPath, "config-example.json"),
  );

  const scheduledTasksDirectoryPath = path.join(bundleRootPath, "scheduled-tasks");
  fs.mkdirSync(scheduledTasksDirectoryPath, { recursive: true });
  copyPath(
    path.join(repoRootPath, "scheduled-tasks", "setup-scheduled-task.example.ps1"),
    path.join(scheduledTasksDirectoryPath, "setup-scheduled-task.example.ps1"),
  );

  copyPath(path.join(repoRootPath, "package.json"), path.join(bundleRootPath, "package.json"));
  copyPath(
    path.join(repoRootPath, "package-lock.json"),
    path.join(bundleRootPath, "package-lock.json"),
  );

  execSync("npm ci --omit=dev", {
    cwd: bundleRootPath,
    stdio: "inherit",
  });

  await downloadNodeRuntime(bundleRootPath);

  fs.writeFileSync(
    path.join(bundleRootPath, "SHELLFORGE_RUNTIME_VERSION"),
    `${runtimeVersion}\n`,
    "utf8",
  );

  console.log("prepare-runtime-bundle - bundleRootPath");
  console.log(bundleRootPath);
}

await prepareRuntimeBundle();
