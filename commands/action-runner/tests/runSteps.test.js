"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { runSteps } = require("../runSteps");

function createIntegrationResources() {
  return {
    runSteps,
  };
}

test("runSteps does not pre-interpolate nested steps of a block step with an empty list", async () => {
  // Scenario: a forEach with an empty list must not interpolate the inner sub-step at the parent level.
  // If parent-level interpolation were applied, the unresolved {{context.missingValue}} placeholder
  // would throw before the (empty) loop body has a chance to skip.
  const resources = createIntegrationResources();
  const runtimeContext = {};

  const parentStep = {
    action: "forEach",
    list: [],
    steps: [
      { action: "setVariable", source: "{{context.missingValue}}", storeAs: "unused" },
    ],
  };

  // Expected: no throw, no iteration, no leftover context keys.
  await runSteps(resources, [parentStep], () => {}, runtimeContext);

  assert.equal("unused" in runtimeContext, false);
  assert.equal("missingValue" in runtimeContext, false);
});

test("runSteps exposes forEach iteration vars to sub-steps via lazy interpolation", async () => {
  // Scenario: sub-steps reference {{context.item}} which is only set per iteration.
  // This only works if parent-level interpolation skipped the nested steps array.
  const resources = createIntegrationResources();
  const runtimeContext = {};

  const parentStep = {
    action: "forEach",
    list: ["alpha", "beta"],
    steps: [
      { action: "setVariable", source: "{{context.item}}", storeAs: "lastItem" },
    ],
  };

  await runSteps(resources, [parentStep], () => {}, runtimeContext);

  assert.equal(runtimeContext.lastItem, "beta");
  assert.equal("item" in runtimeContext, false);
  assert.equal("index" in runtimeContext, false);
});

test("runSteps interpolates non-block step fields", async () => {
  // Scenario: regular steps should have all template fields resolved before the handler runs.
  const resources = createIntegrationResources();
  const runtimeContext = { greeting: "hello" };

  const step = {
    action: "setVariable",
    source: "{{context.greeting}} world",
    storeAs: "message",
  };

  await runSteps(resources, [step], () => {}, runtimeContext);

  assert.equal(runtimeContext.message, "hello world");
});
