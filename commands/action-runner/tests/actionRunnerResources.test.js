"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  createResources,
  getBrowserLaunchOverrides,
  assertUnsupportedBrowserProfileDir,
  ensureBrowserProfileDirectoryExists,
} = require("../action-runner");

const noopLogInfo = () => {};

test("createResources getPage fails fast when browser factory throws", async () => {
  const resources = createResources(false, noopLogInfo, async () => {
    throw new Error("Puppeteer launch failed");
  });

  await assert.rejects(
    () => resources.getPage(),
    /Failed to initialize browser\. Puppeteer launch failed/
  );
});

test("createResources getPage does not crash with undefined newPage error", async () => {
  const resources = createResources(false, noopLogInfo, async () => null);

  await assert.rejects(
    () => resources.getPage(),
    (error) => {
      assert.match(error.message, /Browser launch failed/);
      assert.equal(error.message.includes("newPage"), false);
      return true;
    }
  );
});

test("createResources forwards browser launch overrides to browser factory", async () => {
  const capturedLaunchCalls = [];
  const resources = createResources(
    false,
    noopLogInfo,
    async (isVerboseMode, handleDisconnect, launchOverrides) => {
      capturedLaunchCalls.push({
        isVerboseMode,
        hasDisconnectHandler: typeof handleDisconnect === "function",
        launchOverrides,
      });

      return {
        isConnected: () => true,
        newPage: async () => ({
          setViewport: async () => {},
          isClosed: () => false,
        }),
        close: async () => {},
        on: () => {},
      };
    },
    { userDataDir: ".shellforge-browser-profiles/clockify" }
  );

  await resources.getPage();

  assert.equal(capturedLaunchCalls.length, 1);
  assert.equal(capturedLaunchCalls[0].isVerboseMode, false);
  assert.equal(capturedLaunchCalls[0].hasDisconnectHandler, true);
  assert.deepEqual(capturedLaunchCalls[0].launchOverrides, {
    userDataDir: ".shellforge-browser-profiles/clockify",
  });
});

test("getBrowserLaunchOverrides resolves browserProfile key under project profile directory", () => {
  const projectRoot = path.join("C:", "repo", "shellforge");
  const launchOverrides = getBrowserLaunchOverrides(
    { browserProfile: "clockify" },
    "lancar-horas",
    projectRoot
  );

  assert.deepEqual(launchOverrides, {
    userDataDir: path.resolve(projectRoot, ".shellforge-browser-profiles", "clockify"),
  });
});

test("getBrowserLaunchOverrides returns empty object when browserProfile is missing", () => {
  assert.deepEqual(getBrowserLaunchOverrides({}, "lancar-horas"), {});
  assert.deepEqual(getBrowserLaunchOverrides(null, "lancar-horas"), {});
});

test("getBrowserLaunchOverrides throws on blank browserProfile", () => {
  assert.throws(
    () =>
      getBrowserLaunchOverrides(
        { browserProfile: "   " },
        "lancar-horas"
      ),
    /invalid "browserProfile": value cannot be empty/
  );
});

test("getBrowserLaunchOverrides throws when browserProfile includes path separator", () => {
  assert.throws(
    () =>
      getBrowserLaunchOverrides(
        { browserProfile: "foo/bar" },
        "lancar-horas"
      ),
    /invalid "browserProfile": use only a profile key/
  );
});

test("getBrowserLaunchOverrides throws when browserProfile includes traversal", () => {
  assert.throws(
    () =>
      getBrowserLaunchOverrides(
        { browserProfile: ".." },
        "lancar-horas"
      ),
    /invalid "browserProfile": "\.\." is not allowed/
  );
});

test("assertUnsupportedBrowserProfileDir throws on deprecated key", () => {
  assert.throws(
    () =>
      assertUnsupportedBrowserProfileDir(
        { browserProfileDir: ".shellforge-browser-profiles/clockify" },
        "lancar-horas"
      ),
    /uses deprecated "browserProfileDir"/
  );
});

test("assertUnsupportedBrowserProfileDir allows configs without deprecated key", () => {
  assert.doesNotThrow(() =>
    assertUnsupportedBrowserProfileDir({ browserProfile: "clockify" }, "lancar-horas")
  );
});

test("ensureBrowserProfileDirectoryExists creates profile directory when missing", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "shellforge-profile-test-"));
  const profileDirPath = path.join(
    tempRoot,
    ".shellforge-browser-profiles",
    "clockify"
  );

  try {
    ensureBrowserProfileDirectoryExists({ userDataDir: profileDirPath });
    assert.equal(fs.existsSync(profileDirPath), true);
    assert.equal(fs.statSync(profileDirPath).isDirectory(), true);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("ensureBrowserProfileDirectoryExists is a no-op without userDataDir", () => {
  assert.doesNotThrow(() => ensureBrowserProfileDirectoryExists({}));
  assert.doesNotThrow(() => ensureBrowserProfileDirectoryExists(null));
});
