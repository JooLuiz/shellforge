const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const isWindows = process.platform === "win32";

function runCommand(commandKey, args = []) {
  const batPath = path.join(repoRoot, "commands", commandKey, `${commandKey}.bat`);
  return spawnSync("cmd.exe", ["/c", batPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    windowsHide: true,
  });
}

function createTempDirectory() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shellforge-predefined-"));
}

const describeWindows = isWindows ? describe : describe.skip;

describeWindows("predefined commands integration", () => {
  // Scenario: simple predefined commands should execute on Windows hosts.
  // Expected: uuid prints a GUID and exits successfully.
  it("runs uuid successfully", () => {
    const result = runCommand("uuid");
    assert.equal(result.status, 0);
    assert.match(result.stdout.trim(), /^[0-9a-f-]{36}$/i);
  });

  // Scenario: mkdirp should create nested directories.
  // Expected: command exits zero and the target directory exists.
  it("runs mkdirp successfully", () => {
    const tempDirectory = createTempDirectory();
    const nestedDirectory = path.join(tempDirectory, "nested", "child");

    const result = runCommand("mkdirp", [nestedDirectory]);
    assert.equal(result.status, 0);
    assert.equal(fs.existsSync(nestedDirectory), true);
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  });

  // Scenario: which should fail when command does not exist.
  // Expected: non-zero exit code for unknown executables.
  it("returns failure for missing which target", () => {
    const result = runCommand("which", ["shellforge-definitely-missing-command"]);
    assert.notEqual(result.status, 0);
  });

  // Scenario: head should fail for missing files.
  // Expected: non-zero exit code with file-not-found behavior.
  it("returns failure when head target file is missing", () => {
    const missingFilePath = path.join(createTempDirectory(), "missing.txt");
    const result = runCommand("head", [missingFilePath]);
    assert.notEqual(result.status, 0);
  });

  it("rejects unexpected arguments for reinitialize", () => {
    const result = runCommand("reinitialize", ["--verbose"]);
    assert.notEqual(result.status, 0);
  });

  it("prints repository root from git-root", () => {
    const result = runCommand("git-root");
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim().toLowerCase(), repoRoot.toLowerCase());
  });
});
