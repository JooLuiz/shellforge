"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { handleInvokeAction } = require("../handlers/invokeActionHandler");

const noopLogInfo = () => {};

function createMockResources(actionRunnerConfig, runStepsImplementation) {
  return {
    configs: { actionRunner: actionRunnerConfig },
    normalizeSteps: (actionConfig) => actionConfig.steps,
    runSteps: runStepsImplementation ?? (async () => {}),
  };
}

test("invokeAction runs child action with isolated context", async () => {
  let capturedChildContext = null;

  const resources = createMockResources(
    {
      "child-action": {
        steps: [{ action: "shell", command: "echo hello" }],
      },
    },
    async (_resources, _steps, _logInfo, childContext) => {
      capturedChildContext = childContext;
      childContext.result = "done";
    }
  );

  const parentContext = { existingData: "should-not-leak" };
  const step = {
    action: "invokeAction",
    name: "child-action",
    args: { message: "from parent" },
    storeAs: "childResult",
  };

  await handleInvokeAction(resources, step, noopLogInfo, parentContext);

  assert.equal(capturedChildContext.inputArgs.message, "from parent");
  assert.equal(capturedChildContext.existingData, undefined);
  assert.equal(parentContext.childResult.result, "done");
  assert.equal(parentContext.childResult.inputArgs, undefined);
});

test("invokeAction throws when action not found in config", async () => {
  const resources = createMockResources({});
  const step = { action: "invokeAction", name: "nonexistent-action" };

  await assert.rejects(
    () => handleInvokeAction(resources, step, noopLogInfo, {}),
    /action "nonexistent-action" not found/
  );
});

test("invokeAction enforces max call depth", async () => {
  const resources = createMockResources({
    "recursive-action": {
      steps: [{ action: "shell", command: "echo loop" }],
    },
  });

  const parentContext = { __callDepth: 5 };
  const step = { action: "invokeAction", name: "recursive-action" };

  await assert.rejects(
    () => handleInvokeAction(resources, step, noopLogInfo, parentContext),
    /max call depth \(5\) exceeded/
  );
});

test("invokeAction increments call depth for child context", async () => {
  let capturedDepth = null;

  const resources = createMockResources(
    {
      "depth-check": {
        steps: [{ action: "shell", command: "echo depth" }],
      },
    },
    async (_resources, _steps, _logInfo, childContext) => {
      capturedDepth = childContext.__callDepth;
    }
  );

  const parentContext = { __callDepth: 2 };
  const step = { action: "invokeAction", name: "depth-check" };

  await handleInvokeAction(resources, step, noopLogInfo, parentContext);

  assert.equal(capturedDepth, 3);
});

test("invokeAction with continueOnError catches child errors", async () => {
  const resources = createMockResources(
    {
      "failing-action": {
        steps: [{ action: "shell", command: "echo fail" }],
      },
    },
    async () => {
      throw new Error("child action failed");
    }
  );

  const parentContext = {};
  const step = {
    action: "invokeAction",
    name: "failing-action",
    continueOnError: true,
  };

  await handleInvokeAction(resources, step, noopLogInfo, parentContext);
  assert.ok(true, "should not throw");
});

test("invokeAction without continueOnError propagates child errors", async () => {
  const resources = createMockResources(
    {
      "failing-action": {
        steps: [{ action: "shell", command: "echo fail" }],
      },
    },
    async () => {
      throw new Error("child action exploded");
    }
  );

  const step = { action: "invokeAction", name: "failing-action" };

  await assert.rejects(
    () => handleInvokeAction(resources, step, noopLogInfo, {}),
    /child action exploded/
  );
});

test("invokeAction stores failedStage in parent context when child fails", async () => {
  const resources = createMockResources(
    {
      "failing-action": {
        steps: [{ action: "shell", command: "echo fail" }],
      },
    },
    async () => {
      throw new Error("child action exploded");
    }
  );

  const parentContext = {};
  const step = { action: "invokeAction", name: "failing-action" };

  await assert.rejects(
    () => handleInvokeAction(resources, step, noopLogInfo, parentContext),
    /invokeAction "failing-action" failed: child action exploded/
  );

  assert.equal(parentContext.failedStage, "failing-action");
});

test("invokeAction without storeAs does not modify parent context", async () => {
  const resources = createMockResources(
    {
      "silent-action": {
        steps: [{ action: "shell", command: "echo silent" }],
      },
    },
    async (_resources, _steps, _logInfo, childContext) => {
      childContext.childData = "invisible";
    }
  );

  const parentContext = {};
  const step = { action: "invokeAction", name: "silent-action" };

  await handleInvokeAction(resources, step, noopLogInfo, parentContext);

  assert.equal(parentContext.childData, undefined);
  assert.equal(Object.keys(parentContext).length, 0);
});
