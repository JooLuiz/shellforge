"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { resolveUserDataRoot } = require("../getConfig");
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
          return;
        }

        process.env[envKey] = savedValue;
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
        return;
      }

      if (fs.existsSync(RUNTIME_CONFIG_PATH)) {
        fs.unlinkSync(RUNTIME_CONFIG_PATH);
      }
    }
  };
}

test(
  "resolveUserDataRoot prefers SHELLFORGE_USER_DATA when set",
  withSavedEnv(["SHELLFORGE_USER_DATA", "APPDATA"], () => {
    const envRoot = createTempRoot("shellforge-env-root-");
    process.env.SHELLFORGE_USER_DATA = envRoot;

    assert.equal(resolveUserDataRoot(), path.resolve(envRoot));
  })
);

test(
  "resolveUserDataRoot uses runtime root when config exists there",
  withSavedEnv(["SHELLFORGE_USER_DATA", "APPDATA"], () => {
    delete process.env.SHELLFORGE_USER_DATA;

    assert.ok(fs.existsSync(RUNTIME_CONFIG_PATH));
    assert.equal(resolveUserDataRoot(), RUNTIME_ROOT);
  })
);

test(
  "resolveUserDataRoot uses packaged AppData root when only AppData config exists",
  withSavedEnv(["SHELLFORGE_USER_DATA", "APPDATA"], async () => {
    delete process.env.SHELLFORGE_USER_DATA;

    const appDataRoot = createTempRoot("shellforge-appdata-");
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

test(
  "resolveUserDataRoot defaults to runtime root when no config exists",
  withSavedEnv(["SHELLFORGE_USER_DATA", "APPDATA"], async () => {
    delete process.env.SHELLFORGE_USER_DATA;

    const appDataRoot = createTempRoot("shellforge-empty-appdata-");
    process.env.APPDATA = appDataRoot;

    await withRuntimeConfigBackup(async () => {
      if (fs.existsSync(RUNTIME_CONFIG_PATH)) {
        fs.unlinkSync(RUNTIME_CONFIG_PATH);
      }

      assert.equal(resolveUserDataRoot(), RUNTIME_ROOT);
    })();
  })
);

test(
  "resolveUserDataRoot prefers runtime config over AppData when both exist",
  withSavedEnv(["SHELLFORGE_USER_DATA", "APPDATA"], async () => {
    delete process.env.SHELLFORGE_USER_DATA;

    const appDataRoot = createTempRoot("shellforge-both-appdata-");
    const packagedUserDataRoot = getPackagedUserDataRoot(appDataRoot);
    writeConfigAtRoot(packagedUserDataRoot, '{"actionRunner":{}}');
    process.env.APPDATA = appDataRoot;

    await withRuntimeConfigBackup(async () => {
      writeConfigAtRoot(RUNTIME_ROOT, '{"actionRunner":{"dev":{}}}');
      assert.equal(resolveUserDataRoot(), RUNTIME_ROOT);
    })();
  })
);
