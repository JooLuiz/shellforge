"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const utilsModulePath = require.resolve("../../../utils");
const actionRunnerModulePath = require.resolve("../action-runner");

const originalUtilsModule = require(utilsModulePath);

function withMockedUtils(mockUtilsExports, runTestBody) {
  require.cache[utilsModulePath].exports = {
    ...originalUtilsModule,
    ...mockUtilsExports,
  };
  delete require.cache[actionRunnerModulePath];

  return runTestBody().finally(() => {
    require.cache[utilsModulePath].exports = originalUtilsModule;
    delete require.cache[actionRunnerModulePath];
  });
}

test("parseCliArgs maps --arg.* flags into input argument object", () => {
  const { parseCliArgs } = require("../action-runner");
  const originalArgv = process.argv;

  process.argv = [
    "node",
    "action-runner.js",
    "--arg.ticket=ABC-1",
    "--arg.verbose",
    "--arg.mode=test",
  ];

  try {
    assert.deepEqual(parseCliArgs(), {
      ticket: "ABC-1",
      verbose: "true",
      mode: "test",
    });
  } finally {
    process.argv = originalArgv;
  }
});

test("getAction extracts action name from --action= syntax", () => {
  const { getAction } = require("../action-runner");

  assert.equal(getAction("--action=login-flow"), "login-flow");
  assert.equal(getAction("login-flow"), "login-flow");
});

test("actionRunner throws when action argument is missing", async () => {
  const { actionRunner } = require("../action-runner");

  await assert.rejects(
    () => actionRunner({ isVerbose: false, actionArgument: null }),
    /Missing action to be performed/
  );
});

test("actionRunner throws when configs object is missing actionRunner section", async () => {
  await withMockedUtils(
    {
      getConfigs: async () => ({}),
    },
    async () => {
      const { actionRunner: mockedActionRunner } = require("../action-runner");

      await assert.rejects(
        () =>
          mockedActionRunner({
            isVerbose: false,
            actionArgument: "--action=demo-flow",
          }),
        /Missing Configuration/
      );
    }
  );
});

test("actionRunner throws when action config entry is missing", async () => {
  await withMockedUtils(
    {
      getConfigs: async () => ({ actionRunner: {} }),
    },
    async () => {
      const { actionRunner: mockedActionRunner } = require("../action-runner");

      await assert.rejects(
        () =>
          mockedActionRunner({
            isVerbose: false,
            actionArgument: "--action=missing-action",
          }),
        /Missing Configuration/
      );
    }
  );
});

test("readRuntimeFlags reads verbose and action arguments from process argv", () => {
  const { readRuntimeFlags } = require("../action-runner");
  const originalArgv = process.argv;

  process.argv = ["node", "action-runner.js", "--verbose", "--action=login"];

  try {
    assert.deepEqual(readRuntimeFlags(), {
      isVerbose: true,
      actionArgument: "--action=login",
    });
  } finally {
    process.argv = originalArgv;
  }
});

test("actionRunner runs configured steps and disposes browser resources", async () => {
  const runStepsCalls = [];

  await withMockedUtils(
    {
      getConfigs: async () => ({
        actionRunner: {
          "demo-flow": {
            steps: [{ action: "wait", ms: 0 }],
          },
        },
      }),
      createPuppeteerBrowser: async () => ({
        isConnected: () => true,
        newPage: async () => ({
          isClosed: () => false,
          setViewport: async () => {},
        }),
        close: async () => {},
      }),
    },
    async () => {
      const runStepsModule = require("../runSteps");
      const originalRunSteps = runStepsModule.runSteps;
      runStepsModule.runSteps = async (...args) => {
        runStepsCalls.push(args);
      };

      try {
        const { actionRunner } = require("../action-runner");
        await actionRunner({
          isVerbose: false,
          actionArgument: "--action=demo-flow",
        });
      } finally {
        runStepsModule.runSteps = originalRunSteps;
      }
    }
  );

  assert.equal(runStepsCalls.length, 1);
});

test("getBrowserLaunchOverrides resolves profile directory under user data root", () => {
  const { getBrowserLaunchOverrides } = require("../action-runner");
  const projectRoot = path.resolve("/tmp/shellforge-user-data");

  const overrides = getBrowserLaunchOverrides(
    { browserProfile: "clockify" },
    "demo-flow",
    projectRoot
  );

  assert.equal(
    overrides.userDataDir,
    path.resolve(projectRoot, ".shellforge-browser-profiles", "clockify")
  );
});

test("assertUnsupportedBrowserProfileDir rejects deprecated browserProfileDir", () => {
  const { assertUnsupportedBrowserProfileDir } = require("../action-runner");

  assert.throws(
    () =>
      assertUnsupportedBrowserProfileDir(
        { browserProfileDir: "C:/old/path" },
        "legacy-flow"
      ),
    /deprecated "browserProfileDir"/
  );
});

test("validateBrowserProfileName rejects invalid profile keys", () => {
  const { validateBrowserProfileName } = require("../action-runner");

  assert.throws(
    () => validateBrowserProfileName("", "demo"),
    /invalid "browserProfile"/
  );
  assert.throws(
    () => validateBrowserProfileName("bad/path", "demo"),
    /not a path/
  );
  assert.throws(
    () => validateBrowserProfileName("..", "demo"),
    /"\.\." is not allowed/
  );
});

test("ensureBrowserProfileDirectoryExists creates profile directory", () => {
  const fs = require("fs");
  const os = require("os");
  const path = require("path");
  const { ensureBrowserProfileDirectoryExists } = require("../action-runner");
  const profileDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "shellforge-profile-")
  );

  ensureBrowserProfileDirectoryExists({ userDataDir: profileDirectory });

  assert.equal(fs.existsSync(profileDirectory), true);
});
