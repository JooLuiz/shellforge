"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildLaunchAttempts,
  launchWithAttempts,
} = require("../../../utils/createPuppeteerBrowser");

const noopLogInfo = () => {};

test("buildLaunchAttempts includes default and chrome-channel by default", () => {
  const attempts = buildLaunchAttempts({});

  assert.equal(attempts.length, 2);
  assert.equal(attempts[0].name, "default");
  assert.equal(attempts[1].name, "chrome-channel");
});

test("buildLaunchAttempts appends env-executable when executable path is provided", () => {
  const attempts = buildLaunchAttempts({
    CHROME_PATH: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });

  assert.equal(attempts.length, 3);
  assert.equal(attempts[2].name, "env-executable");
  assert.equal(
    attempts[2].options.executablePath,
    "C:/Program Files/Google/Chrome/Application/chrome.exe"
  );
});

test("buildLaunchAttempts applies userDataDir override to every attempt", () => {
  const attempts = buildLaunchAttempts(
    {},
    { userDataDir: ".shellforge-browser-profiles/clockify" }
  );

  assert.ok(attempts.length >= 2);
  attempts.forEach((attempt) => {
    assert.equal(attempt.options.userDataDir, ".shellforge-browser-profiles/clockify");
  });
});

test("launchWithAttempts falls back to next attempt until one succeeds", async () => {
  const attemptedLaunchNames = [];
  const attempts = [
    { name: "attempt-1", options: { marker: "attempt-1" } },
    { name: "attempt-2", options: { marker: "attempt-2" } },
    { name: "attempt-3", options: { marker: "attempt-3" } },
  ];

  const mockLaunch = async (launchOptions) => {
    attemptedLaunchNames.push(launchOptions.marker);
    if (launchOptions.marker !== "attempt-3") {
      throw new Error(`Failed ${launchOptions.marker}`);
    }
    return {
      on: () => {},
    };
  };

  await launchWithAttempts(mockLaunch, attempts, false, undefined, noopLogInfo);

  assert.deepEqual(attemptedLaunchNames, ["attempt-1", "attempt-2", "attempt-3"]);
});

test("launchWithAttempts throws aggregated launch diagnostics when all attempts fail", async () => {
  const attempts = [
    { name: "default", options: { marker: "default" } },
    { name: "chrome-channel", options: { marker: "chrome-channel" } },
  ];

  const mockLaunch = async (launchOptions) => {
    throw new Error(`Cannot launch ${launchOptions.marker}`);
  };

  await assert.rejects(
    () => launchWithAttempts(mockLaunch, attempts, false, undefined, noopLogInfo),
    /Failed to start Puppeteer browser after 2 attempt\(s\)\. default: Cannot launch default \| chrome-channel: Cannot launch chrome-channel/
  );
});
