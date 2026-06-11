import { execSync } from "node:child_process";
import { createWriteStream } from "node:fs";
import fs from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

export const NODE_RUNTIME_VERSION = "22.16.0";
const NODE_VERSION_FILE_NAME = "NODE_RUNTIME_VERSION";

const uiRootPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bundleRootPath = path.join(uiRootPath, "runtime-bundle");

async function downloadNodeRuntimeZip(destinationZipPath, downloadUrl) {
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(`Failed to download Node runtime (${response.status}): ${downloadUrl}`);
  }

  if (!response.body) {
    throw new Error(`Node runtime download returned an empty body: ${downloadUrl}`);
  }

  await pipeline(response.body, createWriteStream(destinationZipPath));
}

function extractNodeRuntimeZip(zipPath, destinationDirectoryPath) {
  const temporaryExtractDirectoryPath = path.join(
    path.dirname(destinationDirectoryPath),
    "node-extract-temp",
  );
  const extractedRootDirectoryPath = path.join(
    temporaryExtractDirectoryPath,
    `node-v${NODE_RUNTIME_VERSION}-win-x64`,
  );

  fs.rmSync(temporaryExtractDirectoryPath, { recursive: true, force: true });
  fs.mkdirSync(temporaryExtractDirectoryPath, { recursive: true });

  execSync(
    `powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${temporaryExtractDirectoryPath.replace(/'/g, "''")}' -Force"`,
    { stdio: "inherit" },
  );

  fs.rmSync(destinationDirectoryPath, { recursive: true, force: true });
  fs.cpSync(extractedRootDirectoryPath, destinationDirectoryPath, { recursive: true });
  fs.rmSync(temporaryExtractDirectoryPath, { recursive: true, force: true });
}

export async function downloadNodeRuntime(bundleRoot = bundleRootPath) {
  const outputDirectoryPath = path.join(bundleRoot, "nodejs");
  const installedVersion = fs.existsSync(path.join(outputDirectoryPath, NODE_VERSION_FILE_NAME))
    ? fs.readFileSync(path.join(outputDirectoryPath, NODE_VERSION_FILE_NAME), "utf8").trim()
    : null;

  if (installedVersion === NODE_RUNTIME_VERSION && fs.existsSync(path.join(outputDirectoryPath, "node.exe"))) {
    console.log("download-node-runtime - skipped");
    console.log({ version: NODE_RUNTIME_VERSION, outputDirectoryPath });
    return outputDirectoryPath;
  }

  const archiveName = `node-v${NODE_RUNTIME_VERSION}-win-x64.zip`;
  const downloadUrl = `https://nodejs.org/dist/v${NODE_RUNTIME_VERSION}/${archiveName}`;
  const temporaryZipPath = path.join(bundleRoot, archiveName);

  await mkdir(bundleRoot, { recursive: true });

  console.log("download-node-runtime - downloadUrl");
  console.log(downloadUrl);

  await downloadNodeRuntimeZip(temporaryZipPath, downloadUrl);
  extractNodeRuntimeZip(temporaryZipPath, outputDirectoryPath);
  await rm(temporaryZipPath, { force: true });

  fs.writeFileSync(
    path.join(outputDirectoryPath, NODE_VERSION_FILE_NAME),
    `${NODE_RUNTIME_VERSION}\n`,
    "utf8",
  );

  console.log("download-node-runtime - outputDirectoryPath");
  console.log(outputDirectoryPath);

  return outputDirectoryPath;
}

if (import.meta.url === fileURLToPath(import.meta.url)) {
  await downloadNodeRuntime();
}
