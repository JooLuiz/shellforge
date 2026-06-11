"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { handleShell } = require("../handlers/shellHandler");

const noopLogInfo = () => {};

test("shell stores { stdout, stderr, exitCode: 0 } on success", async () => {
  const runtimeContext = {};
  const step = {
    command: "echo hello",
    storeAs: "shellResult",
  };

  await handleShell({}, step, noopLogInfo, runtimeContext);

  assert.ok(runtimeContext.shellResult, "storeAs key must be set in runtimeContext");
  assert.strictEqual(runtimeContext.shellResult.exitCode, 0, "exitCode must be 0 on success");
  assert.ok(typeof runtimeContext.shellResult.stdout === "string", "stdout must be a string");
  assert.ok(typeof runtimeContext.shellResult.stderr === "string", "stderr must be a string");
});

test("shell stores { stdout, stderr, exitCode } with non-zero exitCode when ignoreExitCode is true", async () => {
  const runtimeContext = {};
  const step = {
    command: "exit 1",
    ignoreExitCode: true,
    storeAs: "shellResult",
  };

  await handleShell({}, step, noopLogInfo, runtimeContext);

  assert.ok(runtimeContext.shellResult, "storeAs key must be set in runtimeContext");
  assert.ok(runtimeContext.shellResult.exitCode !== 0, "exitCode must be non-zero on failure");
  assert.ok("stdout" in runtimeContext.shellResult, "stdout must be present");
  assert.ok("stderr" in runtimeContext.shellResult, "stderr must be present");
});

test("shell success and failure paths store the same shape keys", async () => {
  const successContext = {};
  const failureContext = {};

  await handleShell({}, { command: "echo ok", storeAs: "result" }, noopLogInfo, successContext);
  await handleShell(
    {},
    { command: "exit 1", ignoreExitCode: true, storeAs: "result" },
    noopLogInfo,
    failureContext
  );

  const successKeys = Object.keys(successContext.result).sort();
  const failureKeys = Object.keys(failureContext.result).sort();

  assert.deepStrictEqual(successKeys, failureKeys, "success and failure stored shapes must have the same keys");
});

test("shell does not set runtimeContext when storeAs is absent", async () => {
  const runtimeContext = {};
  const step = { command: "echo hello" };

  await handleShell({}, step, noopLogInfo, runtimeContext);

  assert.deepStrictEqual(runtimeContext, {}, "runtimeContext must remain empty when storeAs is absent");
});

test("shell throws when command fails and ignoreExitCode is not set", async () => {
  const step = { command: "exit 1" };

  await assert.rejects(
    () => handleShell({}, step, noopLogInfo, {}),
    /Shell command failed/,
    "must throw when command fails and ignoreExitCode is not set"
  );
});
