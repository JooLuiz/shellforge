/*
 * Copyright (C) 2026 João Luiz de Castro
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CORE_TEST_ROOTS = [
  "commands/action-runner/tests",
  "command-lib/tests",
  "utils/tests",
];

const repoRootPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function collectTestFiles(directoryPath) {
  const discoveredTestFiles = [];

  if (!fs.existsSync(directoryPath)) {
    return discoveredTestFiles;
  }

  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      discoveredTestFiles.push(...collectTestFiles(entryPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".test.js")) {
      discoveredTestFiles.push(entryPath);
    }
  }

  return discoveredTestFiles;
}

function resolveCoreTestFiles() {
  const testFiles = CORE_TEST_ROOTS.flatMap((testRoot) =>
    collectTestFiles(path.join(repoRootPath, testRoot))
  );

  return [...new Set(testFiles)].sort((leftPath, rightPath) =>
    leftPath.localeCompare(rightPath)
  );
}

const testFiles = resolveCoreTestFiles();

if (testFiles.length === 0) {
  console.error("No core test files found under commands/action-runner/tests or command-lib/tests");
  process.exit(1);
}

const testResult = spawnSync(process.execPath, ["--test", ...testFiles], {
  stdio: "inherit",
  cwd: repoRootPath,
});

process.exit(testResult.status ?? 1);
