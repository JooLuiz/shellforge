const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const isWindows = process.platform === "win32";
const actionRunnerBatPath = path.join(
  repoRoot,
  "commands",
  "action-runner",
  "action-runner.bat",
);
const missingActionName = "shellforge-nonexistent-action-for-test";

function runActionRunnerBatFromDirectory(workingDirectory, environmentVariables = {}) {
  return spawnSync("cmd.exe", ["/c", actionRunnerBatPath, `--action=${missingActionName}`], {
    cwd: workingDirectory,
    encoding: "utf8",
    windowsHide: true,
    env: {
      ...process.env,
      ...environmentVariables,
    },
  });
}

function createTempDirectory() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shellforge-action-runner-bat-"));
}

const describeWindows = isWindows ? describe : describe.skip;

describeWindows("action-runner.bat integration", () => {
  it("runs from an arbitrary working directory and reaches the Action Runner runtime", () => {
    const unrelatedWorkingDirectory = createTempDirectory();

    const executionResult = runActionRunnerBatFromDirectory(unrelatedWorkingDirectory, {
      SHELLFORGE_USER_DATA: repoRoot,
    });

    const combinedOutput = `${executionResult.stdout}\n${executionResult.stderr}`;

    assert.notEqual(
      executionResult.status,
      0,
      "Expected a non-zero exit code for a missing action name.",
    );
    assert.match(
      combinedOutput,
      /\[Action Runner\]|Missing Configuration/,
      "Expected Action Runner output when the bat starts Node from an unrelated cwd.",
    );
  });
});
