"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { handleIfElse, evaluateCondition } = require("../handlers/ifElseHandler");

const noopLogInfo = () => {};

function createMockResources(runStepsImplementation) {
  return {
    runSteps: runStepsImplementation ?? (async () => {}),
  };
}

test("evaluateCondition supports eq with numeric coercion", () => {
  assert.equal(evaluateCondition("3", "eq", "3"), true);
  assert.equal(evaluateCondition(3, "eq", "3"), true);
  assert.equal(evaluateCondition("3", "eq", "4"), false);
});

test("evaluateCondition supports ordering operators", () => {
  assert.equal(evaluateCondition(5, "gt", 3), true);
  assert.equal(evaluateCondition(5, "gte", 5), true);
  assert.equal(evaluateCondition(2, "lt", 3), true);
  assert.equal(evaluateCondition(3, "lte", 3), true);
});

test("evaluateCondition exists treats undefined null and empty string as false", () => {
  assert.equal(evaluateCondition(undefined, "exists"), false);
  assert.equal(evaluateCondition(null, "exists"), false);
  assert.equal(evaluateCondition("", "exists"), false);
  assert.equal(evaluateCondition("value", "exists"), true);
  assert.equal(evaluateCondition(0, "exists"), true);
});

test("ifElse runs then steps when condition is true", async () => {
  const executedBlocks = [];

  const resources = createMockResources(async (_resources, steps) => {
    const firstAction = steps[0]?.action;
    if (firstAction === "shell") executedBlocks.push("then");
    if (firstAction === "setVariable") executedBlocks.push("else");
  });

  const step = {
    action: "ifElse",
    left: 2,
    operator: "lt",
    right: 5,
    then: [{ action: "shell", command: "echo then" }],
    else: [{ action: "setVariable", source: "x", storeAs: "y" }],
  };

  await handleIfElse(resources, step, noopLogInfo, {});

  assert.deepEqual(executedBlocks, ["then"]);
});

test("ifElse runs else steps when condition is false", async () => {
  const executedBlocks = [];

  const resources = createMockResources(async (_resources, steps) => {
    const firstAction = steps[0]?.action;
    if (firstAction === "shell") executedBlocks.push("then");
    if (firstAction === "setVariable") executedBlocks.push("else");
  });

  const step = {
    action: "ifElse",
    left: 10,
    operator: "lt",
    right: 5,
    then: [{ action: "shell", command: "echo then" }],
    else: [{ action: "setVariable", source: "x", storeAs: "y" }],
  };

  await handleIfElse(resources, step, noopLogInfo, {});

  assert.deepEqual(executedBlocks, ["else"]);
});

test("ifElse skips both branches when arrays are empty", async () => {
  let runStepsCalled = false;

  const resources = createMockResources(async () => {
    runStepsCalled = true;
  });

  const step = {
    action: "ifElse",
    left: "value",
    operator: "exists",
    then: [],
    else: [],
  };

  await handleIfElse(resources, step, noopLogInfo, {});

  assert.equal(runStepsCalled, false);
});

test("evaluateCondition throws for unsupported operators", () => {
  assert.throws(
    () => evaluateCondition("1", "contains", "1"),
    /unsupported operator "contains"/
  );
});

test("evaluateCondition compares string operands when numeric coercion is not possible", () => {
  assert.equal(evaluateCondition("abc", "eq", "abc"), true);
  assert.equal(evaluateCondition("", "eq", "abc"), false);
});
