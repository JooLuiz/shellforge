"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  resolveUserDataRoot,
  resolveUserDataRootFromInputs,
} = require("../getConfig");
const { getPackagedUserDataRoot } = require("../shellforgePaths");

const RUNTIME_ROOT = path.resolve(__dirname, "..", "..");
const RUNTIME_CONFIG_PATH = path.join(RUNTIME_ROOT, "config", "config.json");

function createTempRoot(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function writeConfigAtRoot(rootPath, configContent = "{}") {
  const configDirectoryPath = path.join(rootPath, "config");
  fs.mkdirSync(configDirectoryPath, { recursive: true });
  fs.writeFileSync(path.join(configDirectoryPath, "config.json"), configContent, "utf8");
}

function withSavedEnv(envKeys, runTest) {
  const savedValues = Object.fromEntries(
    envKeys.map((envKey) => [envKey, process.env[envKey]])
  );

  return async () => {
    try {
      await runTest();
    } finally {
      envKeys.forEach((envKey) => {
        const savedValue = savedValues[envKey];
        if (savedValue === undefined) {
          delete process.env[envKey];
        } else {
          process.env[envKey] = savedValue;
        }
      });
    }
  };
}

function withRuntimeConfigBackup(runTest) {
  const hadRuntimeConfig = fs.existsSync(RUNTIME_CONFIG_PATH);
  const runtimeConfigBackup = hadRuntimeConfig
    ? fs.readFileSync(RUNTIME_CONFIG_PATH, "utf8")
    : null;

  return async () => {
    try {
      await runTest();
    } finally {
      if (hadRuntimeConfig && runtimeConfigBackup !== null) {
        fs.writeFileSync(RUNTIME_CONFIG_PATH, runtimeConfigBackup, "utf8");
      } else if (fs.existsSync(RUNTIME_CONFIG_PATH)) {
        fs.unlinkSync(RUNTIME_CONFIG_PATH);
      }
    }
  };
}

test("resolveUserDataRootFromInputs prefers envUserDataRoot when set", () => {
  const envRoot = createTempRoot("shellforge-env-root-");

  assert.equal(
    resolveUserDataRootFromInputs({
      envUserDataRoot: envRoot,
      runtimeRoot: createTempRoot("shellforge-runtime-"),
      appDataPath: createTempRoot("shellforge-appdata-"),
    }),
    path.resolve(envRoot)
  );
});

test("resolveUserDataRootFromInputs uses runtime root when config exists there", () => {
  const runtimeRoot = createTempRoot("shellforge-runtime-config-");
  writeConfigAtRoot(runtimeRoot, '{"actionRunner":{}}');

  assert.equal(
    resolveUserDataRootFromInputs({
      envUserDataRoot: "",
      runtimeRoot,
      appDataPath: createTempRoot("shellforge-appdata-"),
    }),
    runtimeRoot
  );
});

test("resolveUserDataRootFromInputs uses packaged AppData root when runtime config is missing", () => {
  const runtimeRoot = createTempRoot("shellforge-runtime-empty-");
  const appDataRoot = createTempRoot("shellforge-appdata-config-");
  const packagedUserDataRoot = getPackagedUserDataRoot(appDataRoot);

  assert.equal(
    resolveUserDataRootFromInputs({
      envUserDataRoot: "",
      runtimeRoot,
      appDataPath: appDataRoot,
    }),
    packagedUserDataRoot
  );
});

test("resolveUserDataRootFromInputs uses packaged AppData root when only AppData config exists", () => {
  const runtimeRoot = createTempRoot("shellforge-runtime-empty-");
  const appDataRoot = createTempRoot("shellforge-appdata-config-");
  const packagedUserDataRoot = getPackagedUserDataRoot(appDataRoot);
  writeConfigAtRoot(packagedUserDataRoot, '{"actionRunner":{}}');

  assert.equal(
    resolveUserDataRootFromInputs({
      envUserDataRoot: "",
      runtimeRoot,
      appDataPath: appDataRoot,
    }),
    packagedUserDataRoot
  );
});

test("resolveUserDataRootFromInputs defaults to runtime root when AppData is unavailable", () => {
  const runtimeRoot = createTempRoot("shellforge-runtime-default-");

  assert.equal(
    resolveUserDataRootFromInputs({
      envUserDataRoot: "",
      runtimeRoot,
      appDataPath: "",
    }),
    runtimeRoot
  );
});

test("resolveUserDataRootFromInputs prefers runtime config over AppData when both exist", () => {
  const runtimeRoot = createTempRoot("shellforge-runtime-both-");
  const appDataRoot = createTempRoot("shellforge-appdata-both-");
  const packagedUserDataRoot = getPackagedUserDataRoot(appDataRoot);
  writeConfigAtRoot(runtimeRoot, '{"actionRunner":{"dev":{}}}');
  writeConfigAtRoot(packagedUserDataRoot, '{"actionRunner":{}}');

  assert.equal(
    resolveUserDataRootFromInputs({
      envUserDataRoot: "",
      runtimeRoot,
      appDataPath: appDataRoot,
    }),
    runtimeRoot
  );
});

test(
  "resolveUserDataRoot wrapper prefers SHELLFORGE_USER_DATA when set",
  withSavedEnv(["SHELLFORGE_USER_DATA", "APPDATA"], () => {
    const envRoot = createTempRoot("shellforge-wrapper-env-");
    process.env.SHELLFORGE_USER_DATA = envRoot;

    assert.equal(resolveUserDataRoot(), path.resolve(envRoot));
  })
);

test(
  "resolveUserDataRoot wrapper uses AppData when runtime config is missing",
  withSavedEnv(["SHELLFORGE_USER_DATA", "APPDATA"], async () => {
    delete process.env.SHELLFORGE_USER_DATA;

    const appDataRoot = createTempRoot("shellforge-wrapper-appdata-");
    const packagedUserDataRoot = getPackagedUserDataRoot(appDataRoot);
    writeConfigAtRoot(packagedUserDataRoot, '{"actionRunner":{}}');
    process.env.APPDATA = appDataRoot;

    await withRuntimeConfigBackup(async () => {
      if (fs.existsSync(RUNTIME_CONFIG_PATH)) {
        fs.unlinkSync(RUNTIME_CONFIG_PATH);
      }

      assert.equal(resolveUserDataRoot(), packagedUserDataRoot);
    })();
  })
);
