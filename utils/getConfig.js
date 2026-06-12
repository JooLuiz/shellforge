const fs = require("node:fs");
const path = require("node:path");
const { getPackagedUserDataRoot } = require("./shellforgePaths");

function getRuntimeRoot() {
  return path.resolve(__dirname, "..");
}

function hasConfigAtRoot(rootPath) {
  const configPath = path.join(rootPath, "config", "config.json");
  return fs.existsSync(configPath);
}

function resolveUserDataRoot() {
  const envUserDataRoot = process.env.SHELLFORGE_USER_DATA;
  if (typeof envUserDataRoot === "string" && envUserDataRoot.trim().length > 0) {
    return path.resolve(envUserDataRoot.trim());
  }

  const runtimeRoot = getRuntimeRoot();
  if (hasConfigAtRoot(runtimeRoot)) {
    return runtimeRoot;
  }

  const appDataPath = process.env.APPDATA;
  if (typeof appDataPath === "string" && appDataPath.trim().length > 0) {
    const packagedUserDataRoot = getPackagedUserDataRoot(appDataPath.trim());
    if (hasConfigAtRoot(packagedUserDataRoot)) {
      return packagedUserDataRoot;
    }
  }

  return runtimeRoot;
}

function readConfigFile(configPath) {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found at ${configPath}`);
  }

  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

async function getConfigs() {
  const configPath = path.join(resolveUserDataRoot(), "config", "config.json");
  return readConfigFile(configPath);
}

module.exports = {
  getConfigs,
  resolveUserDataRoot,
};
