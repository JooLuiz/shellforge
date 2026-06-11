"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { handleForEach } = require("../handlers/forEachHandler");

const noopLogInfo = () => {};

function createMockResources(runStepsImplementation) {
  return {
    runSteps: runStepsImplementation ?? (async () => {}),
  };
}

test("forEach iterates a list and exposes item/index to sub-steps", async () => {
  const seenItems = [];
  const seenIndexes = [];

  const resources = createMockResources(async (_resources, _steps, _logInfo, runtimeContext) => {
    seenItems.push(runtimeContext.item);
    seenIndexes.push(runtimeContext.index);
  });

  const runtimeContext = {};
  const step = {
    action: "forEach",
    list: ["alpha", "beta", "gamma"],
    steps: [{ action: "shell", command: "echo {{context.item}}" }],
  };

  await handleForEach(resources, step, noopLogInfo, runtimeContext);

  assert.deepEqual(seenItems, ["alpha", "beta", "gamma"]);
  assert.deepEqual(seenIndexes, [0, 1, 2]);
});

test("forEach with count exposes only the index", async () => {
  const seenSnapshots = [];

  const resources = createMockResources(async (_resources, _steps, _logInfo, runtimeContext) => {
    seenSnapshots.push({
      hasItem: "item" in runtimeContext,
      index: runtimeContext.index,
    });
  });

  const step = {
    action: "forEach",
    count: 3,
    steps: [{ action: "shell", command: "echo {{context.index}}" }],
  };

  await handleForEach(resources, step, noopLogInfo, {});

  assert.deepEqual(seenSnapshots, [
    { hasItem: false, index: 0 },
    { hasItem: false, index: 1 },
    { hasItem: false, index: 2 },
  ]);
});

test("forEach removes item and index from context after the loop completes", async () => {
  const resources = createMockResources(async () => {});
  const runtimeContext = {};

  const step = {
    action: "forEach",
    list: ["only"],
    steps: [{ action: "shell", command: "echo" }],
  };

  await handleForEach(resources, step, noopLogInfo, runtimeContext);

  assert.equal("item" in runtimeContext, false);
  assert.equal("index" in runtimeContext, false);
});

test("forEach restores outer item and index when nested", async () => {
  const resources = createMockResources(async () => {});
  const runtimeContext = { item: "outerItem", index: 42 };

  const step = {
    action: "forEach",
    list: ["innerItem"],
    steps: [{ action: "shell", command: "echo" }],
  };

  await handleForEach(resources, step, noopLogInfo, runtimeContext);

  assert.equal(runtimeContext.item, "outerItem");
  assert.equal(runtimeContext.index, 42);
});

test("forEach with empty list does not call runSteps", async () => {
  let callCount = 0;
  const resources = createMockResources(async () => {
    callCount += 1;
  });

  const step = {
    action: "forEach",
    list: [],
    steps: [{ action: "shell", command: "echo" }],
  };

  await handleForEach(resources, step, noopLogInfo, {});

  assert.equal(callCount, 0);
});

test("forEach throws when list does not resolve to an array", async () => {
  const resources = createMockResources(async () => {});
  const step = {
    action: "forEach",
    list: "still-not-an-array",
    steps: [{ action: "shell", command: "echo" }],
  };

  await assert.rejects(
    () => handleForEach(resources, step, noopLogInfo, {}),
    /forEach "list" must resolve to an array/
  );
});
