const path = require("node:path");

// Keep in sync with ui/src/main/services/shellforgeRuntimeLayout.ts.
const SHELLFORGE_APP_DATA_DIR_NAME = "ShellForge";
const USER_DATA_REPO_DIR_NAME = "shellforge-data";

function getPackagedUserDataRoot(appDataPath) {
  return path.join(appDataPath, SHELLFORGE_APP_DATA_DIR_NAME, USER_DATA_REPO_DIR_NAME);
}

module.exports = {
  SHELLFORGE_APP_DATA_DIR_NAME,
  USER_DATA_REPO_DIR_NAME,
  getPackagedUserDataRoot,
};
