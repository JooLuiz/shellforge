"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeSteps } = require("../normalizeSteps");

test("normalizeSteps accepts mixed actionRunner flow with apiRequest and shell steps", () => {
  // Scenario: a modern action combines API, extraction, shell, and browser steps.
  const actionConfig = {
    steps: [
      { action: "apiRequest", url: "https://example.com/issues", storeAs: "apiResponse" },
      { action: "setVariable", source: "{{context.apiResponse.issues.0.key}}", storeAs: "ticketKey" },
      { action: "shell", command: "echo {{context.ticketKey}}" },
      { action: "navigate", url: "https://example.com" },
    ],
  };

  const steps = normalizeSteps(actionConfig, "jira-flow");

  // Expected: valid steps are preserved in original order.
  assert.equal(steps.length, 4);
  assert.equal(steps[0].action, "apiRequest");
  assert.equal(steps[1].action, "setVariable");
  assert.equal(steps[2].action, "shell");
  assert.equal(steps[3].action, "navigate");
});

test("normalizeSteps accepts forEach with a list and sub-steps", () => {
  const actionConfig = {
    steps: [
      {
        action: "forEach",
        list: ["one", "two"],
        steps: [{ action: "shell", command: "echo {{context.item}}" }],
      },
    ],
  };

  const steps = normalizeSteps(actionConfig, "forEach-list");

  assert.equal(steps.length, 1);
  assert.equal(steps[0].action, "forEach");
});

test("normalizeSteps accepts forEach with a positive count", () => {
  const actionConfig = {
    steps: [
      {
        action: "forEach",
        count: 3,
        steps: [{ action: "shell", command: "echo {{context.index}}" }],
      },
    ],
  };

  const steps = normalizeSteps(actionConfig, "forEach-count");

  assert.equal(steps.length, 1);
  assert.equal(steps[0].count, 3);
});

test("normalizeSteps rejects forEach with both list and count", () => {
  const actionConfig = {
    steps: [
      {
        action: "forEach",
        list: ["one"],
        count: 1,
        steps: [{ action: "shell", command: "echo" }],
      },
    ],
  };

  assert.throws(
    () => normalizeSteps(actionConfig, "forEach-invalid"),
    /forEach requires exactly one of "list" \(array\) or "count" \(positive number\)/
  );
});

test("normalizeSteps rejects forEach with neither list nor count", () => {
  const actionConfig = {
    steps: [
      { action: "forEach", steps: [{ action: "shell", command: "echo" }] },
    ],
  };

  assert.throws(
    () => normalizeSteps(actionConfig, "forEach-missing-source"),
    /forEach requires exactly one of "list" \(array\) or "count" \(positive number\)/
  );
});

test("normalizeSteps rejects forEach when list is not an array", () => {
  const actionConfig = {
    steps: [
      {
        action: "forEach",
        list: "not-an-array",
        steps: [{ action: "shell", command: "echo" }],
      },
    ],
  };

  assert.throws(
    () => normalizeSteps(actionConfig, "forEach-bad-list"),
    /forEach "list" must be an array or a context\/env template reference/
  );
});

test("normalizeSteps accepts forEach with a context template list reference", () => {
  const actionConfig = {
    steps: [
      {
        action: "forEach",
        list: "{{context.userIds}}",
        steps: [{ action: "shell", command: "echo {{context.item}}" }],
      },
    ],
  };

  const steps = normalizeSteps(actionConfig, "forEach-context-list");

  assert.equal(steps.length, 1);
  assert.equal(steps[0].list, "{{context.userIds}}");
});

test("normalizeSteps rejects forEach when count is not a positive integer", () => {
  const actionConfig = {
    steps: [
      {
        action: "forEach",
        count: 0,
        steps: [{ action: "shell", command: "echo" }],
      },
    ],
  };

  assert.throws(
    () => normalizeSteps(actionConfig, "forEach-bad-count"),
    /forEach "count" must be a positive integer/
  );
});

test("normalizeSteps rejects forEach with empty steps array", () => {
  const actionConfig = {
    steps: [{ action: "forEach", list: ["one"], steps: [] }],
  };

  assert.throws(
    () => normalizeSteps(actionConfig, "forEach-empty-steps"),
    /forEach requires a non-empty "steps" array/
  );
});

test("normalizeSteps validates forEach sub-steps recursively (full registry)", () => {
  // Scenario: forEach allows any registered action, so an invalid sub-step must still fail.
  const actionConfig = {
    steps: [
      {
        action: "forEach",
        list: ["one"],
        steps: [{ action: "shell" }],
      },
    ],
  };

  assert.throws(
    () => normalizeSteps(actionConfig, "forEach-bad-substep"),
    /shell step requires "command" or "commands"/
  );
});

test("normalizeSteps accepts forEachElement with wait sub-step", () => {
  const actionConfig = {
    steps: [
      {
        action: "forEachElement",
        selector: ".row",
        steps: [{ action: "wait", ms: 200 }],
      },
    ],
  };

  const steps = normalizeSteps(actionConfig, "forEachElement-wait");
  assert.equal(steps[0].steps[0].action, "wait");
});

test("normalizeSteps accepts forEachElement with apiRequest sub-step", () => {
  const actionConfig = {
    steps: [
      {
        action: "forEachElement",
        selector: ".row",
        steps: [{ action: "apiRequest", url: "https://example.com/track" }],
      },
    ],
  };

  const steps = normalizeSteps(actionConfig, "forEachElement-apiRequest");
  assert.equal(steps[0].steps[0].action, "apiRequest");
});

test("normalizeSteps rejects forEachElement with disallowed sub-step action", () => {
  const actionConfig = {
    steps: [
      {
        action: "forEachElement",
        selector: ".row",
        steps: [{ action: "shell", command: "echo invalid" }],
      },
    ],
  };

  assert.throws(
    () => normalizeSteps(actionConfig, "forEachElement-bad-substep"),
    /forEachElement sub-step action "shell" is not allowed/
  );
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

test("normalizeSteps accepts wait step with ms: 0", () => {
  const actionConfig = { steps: [{ action: "wait", ms: 0 }] };
  const steps = normalizeSteps(actionConfig, "wait-zero-ms");
  assert.equal(steps[0].ms, 0);
});

test("normalizeSteps accepts wait step with a positive ms value", () => {
  const actionConfig = { steps: [{ action: "wait", ms: 1000 }] };
  const steps = normalizeSteps(actionConfig, "wait-positive-ms");
  assert.equal(steps[0].ms, 1000);
});

test("normalizeSteps rejects wait step without ms", () => {
  const actionConfig = { steps: [{ action: "wait" }] };
  assert.throws(
    () => normalizeSteps(actionConfig, "wait-missing-ms"),
    /wait step requires "ms" to be a non-negative number/
  );
});

test("normalizeSteps rejects wait step with negative ms", () => {
  const actionConfig = { steps: [{ action: "wait", ms: -1 }] };
  assert.throws(
    () => normalizeSteps(actionConfig, "wait-negative-ms"),
    /wait step requires "ms" to be a non-negative number/
  );
});

test("normalizeSteps rejects wait step with non-numeric ms", () => {
  const actionConfig = { steps: [{ action: "wait", ms: "1000" }] };
  assert.throws(
    () => normalizeSteps(actionConfig, "wait-string-ms"),
    /wait step requires "ms" to be a non-negative number/
  );
});

test("normalizeSteps accepts waitForPageState with selector", () => {
  const actionConfig = {
    steps: [{ action: "waitForPageState", selector: "#main", timeout: 5000 }],
  };
  const steps = normalizeSteps(actionConfig, "wait-page-state-selector");
  assert.equal(steps[0].selector, "#main");
});

test("normalizeSteps accepts waitForPageState with urlContains", () => {
  const actionConfig = {
    steps: [{ action: "waitForPageState", urlContains: "/dashboard" }],
  };
  const steps = normalizeSteps(actionConfig, "wait-page-state-url");
  assert.equal(steps[0].urlContains, "/dashboard");
});

test("normalizeSteps accepts waitForPageState with waitForLoading: true", () => {
  const actionConfig = {
    steps: [{ action: "waitForPageState", waitForLoading: true }],
  };
  const steps = normalizeSteps(actionConfig, "wait-page-state-loading");
  assert.equal(steps[0].waitForLoading, true);
});

test("normalizeSteps rejects waitForPageState with none of the polling fields", () => {
  const actionConfig = { steps: [{ action: "waitForPageState" }] };
  assert.throws(
    () => normalizeSteps(actionConfig, "wait-page-state-empty"),
    /waitForPageState step requires at least one of "selector", "urlContains", or "waitForLoading": true/
  );
});

test("normalizeSteps accepts ifElse with then and else branches", () => {
  const actionConfig = {
    steps: [
      {
        action: "ifElse",
        left: "{{context.retries}}",
        operator: "lt",
        right: "3",
        then: [{ action: "shell", command: "echo then" }],
        else: [{ action: "shell", command: "echo else" }],
      },
    ],
  };

  const steps = normalizeSteps(actionConfig, "if-else-flow");

  assert.equal(steps[0].action, "ifElse");
  assert.equal(steps[0].then.length, 1);
  assert.equal(steps[0].else.length, 1);
});

test("normalizeSteps rejects ifElse missing right when operator is not exists", () => {
  const actionConfig = {
    steps: [
      {
        action: "ifElse",
        left: "{{context.retries}}",
        operator: "eq",
        then: [],
      },
    ],
  };

  assert.throws(
    () => normalizeSteps(actionConfig, "if-else-missing-right"),
    /ifElse requires a non-empty "right" operand unless operator is "exists"/
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

test("normalizeSteps rejects empty steps array", () => {
  assert.throws(
    () => normalizeSteps({ steps: [] }, "empty-steps"),
    /must define a non-empty "steps" array/
  );
});

test("normalizeSteps rejects unknown action names", () => {
  assert.throws(
    () => normalizeSteps({ steps: [{ action: "unknownAction", value: "x" }] }, "unknown"),
    /unknown action "unknownAction"/
  );
});

test("normalizeSteps rejects setWebStorage without storage payloads", () => {
  assert.throws(
    () => normalizeSteps({ steps: [{ action: "setWebStorage" }] }, "set-web-storage-empty"),
    /setWebStorage step requires at least one of "localStorage", "sessionStorage", or "cookies"/
  );
});

test("normalizeSteps rejects apiRequest basic auth without credentials", () => {
  assert.throws(
    () =>
      normalizeSteps(
        {
          steps: [
            {
              action: "apiRequest",
              url: "https://example.com",
              auth: { type: "basic", username: "user" },
            },
          ],
        },
        "api-request-auth"
      ),
    /requires "auth.username" and "auth.password"/
  );
});

test("normalizeSteps rejects getArguments with invalid required type", () => {
  assert.throws(
    () =>
      normalizeSteps(
        { steps: [{ action: "getArguments", required: "ticket" }] },
        "get-arguments-invalid-required"
      ),
    /getArguments "required" must be an array/
  );
});

test("normalizeSteps rejects tryCatch without try steps", () => {
  assert.throws(
    () => normalizeSteps({ steps: [{ action: "tryCatch", try: [] }] }, "try-catch-empty"),
    /tryCatch requires a non-empty "try" array/
  );
});

test("normalizeSteps rejects ifElse with unsupported operator", () => {
  assert.throws(
    () =>
      normalizeSteps(
        {
          steps: [
            {
              action: "ifElse",
              left: "1",
              operator: "contains",
              right: "2",
              then: [],
            },
          ],
        },
        "if-else-operator"
      ),
    /ifElse "operator" must be one of/
  );
});

test("normalizeSteps rejects legacy config when required field is missing", () => {
  assert.throws(
    () =>
      normalizeSteps(
        {
          url: "https://example.com/login",
          usernameInput: "#email",
          usernameValue: "user@example.com",
          passwordInput: "#password",
        },
        "legacy-missing-field"
      ),
    /Legacy action config missing field "passwordValue"/
  );
});

test("normalizeSteps rejects invalid step objects and missing action fields", () => {
  assert.throws(
    () => normalizeSteps({ steps: [null] }, "invalid-step-object"),
    /step must be an object/
  );

  assert.throws(
    () => normalizeSteps({ steps: [{ action: "" }] }, "missing-action"),
    /missing or invalid "action"/
  );
});

test("normalizeSteps validates ifElse else branch and tryCatch catch arrays", () => {
  assert.throws(
    () =>
      normalizeSteps(
        {
          steps: [
            {
              action: "ifElse",
              left: "1",
              operator: "exists",
              then: [],
              else: "invalid",
            },
          ],
        },
        "if-else-invalid-else"
      ),
    /ifElse "else" must be an array/
  );

  assert.throws(
    () =>
      normalizeSteps(
        {
          steps: [
            {
              action: "tryCatch",
              try: [{ action: "wait", ms: 0 }],
              catch: "invalid",
            },
          ],
        },
        "try-catch-invalid-catch"
      ),
    /tryCatch "catch" must be an array/
  );
});

test("normalizeSteps validates getArguments optional and defaults fields", () => {
  assert.throws(
    () =>
      normalizeSteps(
        { steps: [{ action: "getArguments", optional: "ticket" }] },
        "get-arguments-invalid-optional"
      ),
    /getArguments "optional" must be an array/
  );

  assert.throws(
    () =>
      normalizeSteps(
        { steps: [{ action: "getArguments", defaults: [] }] },
        "get-arguments-invalid-defaults"
      ),
    /getArguments "defaults" must be an object/
  );
});

test("normalizeSteps rejects forEachElement with empty sub-steps", () => {
  assert.throws(
    () =>
      normalizeSteps(
        {
          steps: [{ action: "forEachElement", selector: ".row", steps: [] }],
        },
        "for-each-element-empty"
      ),
    /forEachElement requires a non-empty "steps" array/
  );
});
