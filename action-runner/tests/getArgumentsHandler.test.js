"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { handleGetArguments } = require("../handlers/getArgumentsHandler");

const noopLogInfo = () => {};

test("getArguments maps required args from inputArgs into context", async () => {
  const runtimeContext = { inputArgs: { message: "hello", priority: "high" } };
  const step = { action: "getArguments", required: ["message", "priority"] };

  await handleGetArguments(null, step, noopLogInfo, runtimeContext);

  assert.equal(runtimeContext.message, "hello");
  assert.equal(runtimeContext.priority, "high");
});

test("getArguments throws when required arg is missing", async () => {
  const runtimeContext = { inputArgs: { priority: "low" } };
  const step = { action: "getArguments", required: ["message", "recipient"] };

  await assert.rejects(
    () => handleGetArguments(null, step, noopLogInfo, runtimeContext),
    /missing required argument\(s\): message, recipient/
  );
});

test("getArguments throws when required arg is empty string", async () => {
  const runtimeContext = { inputArgs: { message: "" } };
  const step = { action: "getArguments", required: ["message"] };

  await assert.rejects(
    () => handleGetArguments(null, step, noopLogInfo, runtimeContext),
    /missing required argument\(s\): message/
  );
});

test("getArguments applies defaults for missing optional args", async () => {
  const runtimeContext = { inputArgs: {} };
  const step = {
    action: "getArguments",
    required: [],
    defaults: { priority: "normal", format: "json" },
  };

  await handleGetArguments(null, step, noopLogInfo, runtimeContext);

  assert.equal(runtimeContext.priority, "normal");
  assert.equal(runtimeContext.format, "json");
});

test("getArguments does not override inputArgs values with defaults", async () => {
  const runtimeContext = { inputArgs: { priority: "urgent" } };
  const step = {
    action: "getArguments",
    required: [],
    optional: ["priority"],
    defaults: { priority: "normal" },
  };

  await handleGetArguments(null, step, noopLogInfo, runtimeContext);

  assert.equal(runtimeContext.priority, "urgent");
});

test("getArguments maps optional args when present in inputArgs", async () => {
  const runtimeContext = { inputArgs: { message: "hi", format: "xml" } };
  const step = {
    action: "getArguments",
    required: ["message"],
    optional: ["format"],
  };

  await handleGetArguments(null, step, noopLogInfo, runtimeContext);

  assert.equal(runtimeContext.message, "hi");
  assert.equal(runtimeContext.format, "xml");
});

test("getArguments skips optional args not present in inputArgs", async () => {
  const runtimeContext = { inputArgs: { message: "hi" } };
  const step = {
    action: "getArguments",
    required: ["message"],
    optional: ["format"],
  };

  await handleGetArguments(null, step, noopLogInfo, runtimeContext);

  assert.equal(runtimeContext.message, "hi");
  assert.equal(runtimeContext.format, undefined);
});

test("getArguments works with no required, optional, or defaults", async () => {
  const runtimeContext = { inputArgs: { anything: "value" } };
  const step = { action: "getArguments" };

  await handleGetArguments(null, step, noopLogInfo, runtimeContext);

  assert.equal(runtimeContext.anything, undefined);
});
