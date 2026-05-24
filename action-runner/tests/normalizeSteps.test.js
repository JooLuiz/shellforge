"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeSteps } = require("../normalizeSteps");

test("normalizeSteps accepts mixed actionRunner flow with apiRequest and shell steps", () => {
  // Scenario: a modern action combines API, extraction, shell, and browser steps.
  const actionConfig = {
    steps: [
      { action: "apiRequest", url: "https://example.com/issues", storeAs: "apiResponse" },
      { action: "extractVariable", source: "{{context.apiResponse.issues.0.key}}", storeAs: "ticketKey" },
      { action: "shell", command: "echo {{context.ticketKey}}" },
      { action: "navigate", url: "https://example.com" },
    ],
  };

  const steps = normalizeSteps(actionConfig, "jira-flow");

  // Expected: valid steps are preserved in original order.
  assert.equal(steps.length, 4);
  assert.equal(steps[0].action, "apiRequest");
  assert.equal(steps[1].action, "extractVariable");
  assert.equal(steps[2].action, "shell");
  assert.equal(steps[3].action, "navigate");
});

test("normalizeSteps rejects shell step without command", () => {
  // Scenario: shell steps must define either a single command or a commands list.
  const actionConfig = {
    steps: [
      { action: "shell" },
    ],
  };

  // Expected: validation raises a clear shell-specific error.
  assert.throws(
    () => normalizeSteps(actionConfig, "invalid-shell"),
    /shell step requires "command" or "commands"/
  );
});

test("normalizeSteps converts legacy flat fields to default browser flow", () => {
  // Scenario: existing legacy login configs must continue working after migration.
  const actionConfig = {
    url: "https://example.com/login",
    usernameInput: "#email",
    usernameValue: "user@example.com",
    passwordInput: "#password",
    passwordValue: "secret",
    loginButton: "#submit",
  };

  const steps = normalizeSteps(actionConfig, "legacy-login");

  // Expected: legacy format is transformed into navigate/type/type/click.
  assert.deepEqual(steps.map((step) => step.action), ["navigate", "type", "type", "click"]);
});
