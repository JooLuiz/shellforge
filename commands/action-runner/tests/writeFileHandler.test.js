"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { handleWriteFile } = require("../handlers/writeFileHandler");

function buildTempPath(filename) {
  return path.join(os.tmpdir(), `action-runner-test-${Date.now()}-${filename}`);
}

function noopLogInfo() {}

function deleteFileIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

test("writeFile writes string content to the specified path", async () => {
  const filePath = buildTempPath("string-test.txt");

  try {
    const step = { path: filePath, content: "hello world" };
    await handleWriteFile({}, step, noopLogInfo, {});

    const writtenContent = fs.readFileSync(filePath, "utf8");
    assert.equal(writtenContent, "hello world");
  } finally {
    deleteFileIfExists(filePath);
  }
});

test("writeFile auto-stringifies object content as indented JSON", async () => {
  const filePath = buildTempPath("object-test.json");
  const objectContent = { summary: "Fix login", priority: { name: "High" } };

  try {
    const step = { path: filePath, content: objectContent };
    await handleWriteFile({}, step, noopLogInfo, {});

    const writtenContent = fs.readFileSync(filePath, "utf8");
    assert.equal(writtenContent, JSON.stringify(objectContent, null, 2));
  } finally {
    deleteFileIfExists(filePath);
  }
});

test("writeFile auto-stringifies array content as indented JSON", async () => {
  const filePath = buildTempPath("array-test.json");
  const arrayContent = [{ key: "ELOR-123" }, { key: "ELOR-456" }];

  try {
    const step = { path: filePath, content: arrayContent };
    await handleWriteFile({}, step, noopLogInfo, {});

    const writtenContent = fs.readFileSync(filePath, "utf8");
    assert.equal(writtenContent, JSON.stringify(arrayContent, null, 2));
  } finally {
    deleteFileIfExists(filePath);
  }
});

test("writeFile stores resolved file path in context via storeAs", async () => {
  const filePath = buildTempPath("storeas-test.txt");
  const runtimeContext = {};

  try {
    const step = { path: filePath, content: "data", storeAs: "outputPath" };
    await handleWriteFile({}, step, noopLogInfo, runtimeContext);

    assert.equal(runtimeContext.outputPath, path.resolve(filePath));
  } finally {
    deleteFileIfExists(filePath);
  }
});

test("writeFile does not modify context when storeAs is not provided", async () => {
  const filePath = buildTempPath("no-storeas-test.txt");
  const runtimeContext = {};

  try {
    const step = { path: filePath, content: "data" };
    await handleWriteFile({}, step, noopLogInfo, runtimeContext);

    assert.deepEqual(runtimeContext, {});
  } finally {
    deleteFileIfExists(filePath);
  }
});

test("writeFile creates backup when backupIfExists is true and file exists", async () => {
  const filePath = buildTempPath("backup-test.json");
  const logMessages = [];

  fs.writeFileSync(filePath, "old-content", "utf8");

  try {
    const step = {
      path: filePath,
      content: { status: "new-content" },
      backupIfExists: true,
    };

    await handleWriteFile({}, step, (message) => logMessages.push(message), {});

    const currentContent = fs.readFileSync(filePath, "utf8");
    assert.equal(currentContent, JSON.stringify({ status: "new-content" }, null, 2));

    const backupLogMessage = logMessages.find((message) =>
      message.startsWith("Backed up existing file to ")
    );
    assert.ok(backupLogMessage);

    const backupFilePath = backupLogMessage.replace("Backed up existing file to ", "");
    const backupContent = fs.readFileSync(backupFilePath, "utf8");
    assert.equal(backupContent, "old-content");
    deleteFileIfExists(backupFilePath);
  } finally {
    deleteFileIfExists(filePath);
  }
});

test("writeFile backupIfExists true succeeds when target file does not exist", async () => {
  const filePath = buildTempPath("backup-no-file-test.txt");

  try {
    const step = {
      path: filePath,
      content: "new-content",
      backupIfExists: true,
    };

    await handleWriteFile({}, step, noopLogInfo, {});
    const currentContent = fs.readFileSync(filePath, "utf8");
    assert.equal(currentContent, "new-content");
  } finally {
    deleteFileIfExists(filePath);
  }
});

test("writeFile overwrites existing file without backup when backupIfExists is false", async () => {
  const filePath = buildTempPath("overwrite-no-backup-test.txt");
  const logMessages = [];

  fs.writeFileSync(filePath, "old-content", "utf8");

  try {
    const step = {
      path: filePath,
      content: "new-content",
      backupIfExists: false,
    };

    await handleWriteFile({}, step, (message) => logMessages.push(message), {});
    const currentContent = fs.readFileSync(filePath, "utf8");
    assert.equal(currentContent, "new-content");

    const hasBackupLog = logMessages.some((message) => message.startsWith("Backed up existing file to "));
    assert.equal(hasBackupLog, false);
  } finally {
    deleteFileIfExists(filePath);
  }
});
