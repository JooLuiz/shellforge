const fs = require("node:fs");
const path = require("node:path");

function resolveUserDataRoot() {
  const userDataRoot = process.env.SHELLFORGE_USER_DATA;
  if (typeof userDataRoot === "string" && userDataRoot.trim().length > 0) {
    return path.resolve(userDataRoot.trim());
  }

  return path.resolve(__dirname, "..");
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
