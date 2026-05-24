"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { handleTryCatch } = require("../handlers/tryCatchHandler");

const noopLogInfo = () => {};

function createMockResources(runStepsImplementation) {
  return {
    runSteps: runStepsImplementation ?? (async () => {}),
  };
}

test("tryCatch runs try steps and skips catch on success", async () => {
  const executedBlocks = [];

  const resources = createMockResources(async (_resources, steps) => {
    const firstAction = steps[0]?.action;
    if (firstAction === "shell") executedBlocks.push("try");
    if (firstAction === "extractVariable") executedBlocks.push("catch");
  });

  const step = {
    action: "tryCatch",
    try: [{ action: "shell", command: "echo ok" }],
    catch: [{ action: "extractVariable", source: "x", storeAs: "y" }],
  };

  await handleTryCatch(resources, step, noopLogInfo, {});

  assert.deepEqual(executedBlocks, ["try"]);
});

test("tryCatch runs catch steps and stores errorMessage on failure", async () => {
  const executedBlocks = [];

  const resources = createMockResources(async (_resources, steps) => {
    const firstAction = steps[0]?.action;
    if (firstAction === "shell") {
      executedBlocks.push("try");
      throw new Error("shell command failed");
    }
    if (firstAction === "extractVariable") {
      executedBlocks.push("catch");
    }
  });

  const runtimeContext = {};
  const step = {
    action: "tryCatch",
    try: [{ action: "shell", command: "echo fail" }],
    catch: [{ action: "extractVariable", source: "x", storeAs: "y" }],
  };

  await handleTryCatch(resources, step, noopLogInfo, runtimeContext);

  assert.deepEqual(executedBlocks, ["try", "catch"]);
  assert.equal(runtimeContext.errorMessage, "shell command failed");
});

test("tryCatch re-throws error when no catch steps are defined", async () => {
  const resources = createMockResources(async () => {
    throw new Error("unhandled failure");
  });

  const step = {
    action: "tryCatch",
    try: [{ action: "shell", command: "echo fail" }],
  };

  await assert.rejects(
    () => handleTryCatch(resources, step, noopLogInfo, {}),
    /unhandled failure/
  );
});

test("tryCatch runs finally steps regardless of success", async () => {
  const executedBlocks = [];

  const resources = createMockResources(async (_resources, steps) => {
    const firstAction = steps[0]?.action;
    if (firstAction === "shell") executedBlocks.push("try");
    if (firstAction === "navigate") executedBlocks.push("finally");
  });

  const step = {
    action: "tryCatch",
    try: [{ action: "shell", command: "echo ok" }],
    finally: [{ action: "navigate", url: "https://cleanup.example.com" }],
  };

  await handleTryCatch(resources, step, noopLogInfo, {});

  assert.deepEqual(executedBlocks, ["try", "finally"]);
});

test("tryCatch runs finally steps regardless of failure", async () => {
  const executedBlocks = [];

  const resources = createMockResources(async (_resources, steps) => {
    const firstAction = steps[0]?.action;
    if (firstAction === "shell") {
      executedBlocks.push("try");
      throw new Error("try failed");
    }
    if (firstAction === "extractVariable") executedBlocks.push("catch");
    if (firstAction === "navigate") executedBlocks.push("finally");
  });

  const step = {
    action: "tryCatch",
    try: [{ action: "shell", command: "echo fail" }],
    catch: [{ action: "extractVariable", source: "x", storeAs: "y" }],
    finally: [{ action: "navigate", url: "https://cleanup.example.com" }],
  };

  await handleTryCatch(resources, step, noopLogInfo, {});

  assert.deepEqual(executedBlocks, ["try", "catch", "finally"]);
});

test("tryCatch with no catch re-throws but still runs finally", async () => {
  const executedBlocks = [];

  const resources = createMockResources(async (_resources, steps) => {
    const firstAction = steps[0]?.action;
    if (firstAction === "shell") {
      executedBlocks.push("try");
      throw new Error("boom");
    }
    if (firstAction === "navigate") executedBlocks.push("finally");
  });

  const step = {
    action: "tryCatch",
    try: [{ action: "shell", command: "echo fail" }],
    finally: [{ action: "navigate", url: "https://cleanup.example.com" }],
  };

  await assert.rejects(
    () => handleTryCatch(resources, step, noopLogInfo, {}),
    /boom/
  );

  assert.deepEqual(executedBlocks, ["try", "finally"]);
});
