"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { interpolateStep } = require("../interpolateContext");

test("interpolateStep resolves context placeholders in full-string expressions", () => {
  // Scenario: the step value is only a template token and should keep the original value type.
  const step = {
    action: "extractVariable",
    source: "{{context.jiraResponse.issues.0.key}}",
    storeAs: "ticketKey",
  };
  const runtimeContext = {
    jiraResponse: {
      issues: [{ key: "ELOR-123" }],
    },
  };

  const interpolatedStep = interpolateStep(step, runtimeContext);

  // Expected: source is resolved from runtime context and stored as plain string.
  assert.equal(interpolatedStep.source, "ELOR-123");
});

test("interpolateStep resolves environment placeholders and mixed literals", () => {
  // Scenario: the step string combines literals and placeholders from both context and env.
  process.env.ACTION_RUNNER_TEST_ENV = "demo@example.com";
  const step = {
    action: "shell",
    command: "echo {{context.ticketKey}} {{env.ACTION_RUNNER_TEST_ENV}}",
  };
  const runtimeContext = {
    ticketKey: "ELOR-456",
  };

  const interpolatedStep = interpolateStep(step, runtimeContext);

  // Expected: placeholders are replaced while preserving surrounding literals.
  assert.equal(interpolatedStep.command, "echo ELOR-456 demo@example.com");
});

test("interpolateStep resolves placeholders deeply in nested objects and arrays", () => {
  // Scenario: nested step structures must also receive interpolation, not only root fields.
  const step = {
    action: "apiRequest",
    headers: {
      "X-Ticket": "{{context.ticketKey}}",
    },
    params: [
      "{{context.ticketKey}}",
      "static",
    ],
  };
  const runtimeContext = {
    ticketKey: "ELOR-789",
  };

  const interpolatedStep = interpolateStep(step, runtimeContext);

  // Expected: all nested placeholders are resolved recursively.
  assert.equal(interpolatedStep.headers["X-Ticket"], "ELOR-789");
  assert.deepEqual(interpolatedStep.params, ["ELOR-789", "static"]);
});

test("interpolateStep throws when a full-string env variable has no value", () => {
  delete process.env.NONEXISTENT_TEST_VAR;
  const step = {
    action: "type",
    value: "{{env.NONEXISTENT_TEST_VAR}}",
  };

  assert.throws(
    () => interpolateStep(step, {}),
    /variable "\{\{env\.NONEXISTENT_TEST_VAR\}\}" has no value/
  );
});

test("interpolateStep throws when an env variable in a mixed string has no value", () => {
  delete process.env.MISSING_PARTIAL_VAR;
  const step = {
    action: "shell",
    command: "echo {{env.MISSING_PARTIAL_VAR}} suffix",
  };

  assert.throws(
    () => interpolateStep(step, {}),
    /variable "\{\{env\.MISSING_PARTIAL_VAR\}\}" has no value/
  );
});

test("interpolateStep serializes objects as JSON in partial-match strings", () => {
  const step = {
    action: "shell",
    command: "$ticketData = '{{context.ticketDetails}}'",
  };
  const runtimeContext = {
    ticketDetails: { summary: "Fix login", priority: { name: "High" } },
  };

  const interpolatedStep = interpolateStep(step, runtimeContext);

  const expectedJson = JSON.stringify(runtimeContext.ticketDetails);
  assert.equal(interpolatedStep.command, `$ticketData = '${expectedJson}'`);
});

test("interpolateStep preserves object type for full-string matches", () => {
  const step = {
    action: "extractVariable",
    source: "{{context.ticketDetails}}",
  };
  const runtimeContext = {
    ticketDetails: { summary: "Fix login", fields: [1, 2] },
  };

  const interpolatedStep = interpolateStep(step, runtimeContext);

  assert.deepEqual(interpolatedStep.source, runtimeContext.ticketDetails);
});

test("interpolateStep throws when a context variable has no value", () => {
  const step = {
    action: "extractVariable",
    source: "{{context.nonexistent.path}}",
  };

  assert.throws(
    () => interpolateStep(step, {}),
    /variable "\{\{context\.nonexistent\.path\}\}" has no value/
  );
});
