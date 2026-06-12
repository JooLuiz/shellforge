import { app, BrowserWindow } from "electron";
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_WINDOW_BACKGROUND } from "../shared/themeBridge";
import { registerBrowserProfilesIpcHandlers } from "./ipc/browserProfiles";
import { registerCustomActionsIpcHandlers } from "./ipc/customActions";
import { registerConfigIpcHandlers } from "./ipc/config";
import { registerProfileIpcHandlers } from "./ipc/profile";
import { registerScheduledTasksIpcHandlers } from "./ipc/scheduledTasks";
import { registerThemeIpcHandlers } from "./ipc/theme";
import { registerLocaleIpcHandlers } from "./ipc/locale";
import { openExternalHttpUrl } from "./openExternalUrl";
import { resolveWindowIconPath } from "./windowIconPath";
import { configurePackagedUserDataPath } from "./services/configurePackagedUserDataPath";
import { ensurePackagedUserData } from "./services/packagedDataBootstrap";

configurePackagedUserDataPath();

const WINDOWS_APP_USER_MODEL_ID = "app.shellforge";

let mainBrowserWindow: BrowserWindow | null = null;

function resolvePreloadPath(): string {
  const preloadMjsPath = path.join(__dirname, "../preload/index.mjs");
  if (fs.existsSync(preloadMjsPath)) {
    return preloadMjsPath;
  }

  const preloadJsPath = path.join(__dirname, "../preload/index.js");
  if (fs.existsSync(preloadJsPath)) {
    return preloadJsPath;
  }

  throw new Error(
    `Preload script not found. Checked paths: "${preloadMjsPath}" and "${preloadJsPath}".`
  );
}

function createWindow(): void {
  const preloadPath = resolvePreloadPath();
  const windowIconPath = resolveWindowIconPath();

  const browserWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    icon: windowIconPath,
    backgroundColor: DEFAULT_WINDOW_BACKGROUND,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainBrowserWindow = browserWindow;
  browserWindow.on("closed", () => {
    if (mainBrowserWindow === browserWindow) {
      mainBrowserWindow = null;
    }
  });

  browserWindow.webContents.setWindowOpenHandler(({ url }) => {
    openExternalHttpUrl(url);
    return { action: "deny" };
  });

  browserWindow.setTitle("ShellForge");

  if (process.env.ELECTRON_RENDERER_URL) {
    browserWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    browserWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  if (process.platform === "win32") {
    app.setAppUserModelId(WINDOWS_APP_USER_MODEL_ID);
  }

  ensurePackagedUserData();

  registerConfigIpcHandlers();
  registerProfileIpcHandlers();
  registerScheduledTasksIpcHandlers();
  registerBrowserProfilesIpcHandlers();
  registerCustomActionsIpcHandlers();
  registerThemeIpcHandlers(() => mainBrowserWindow);
  registerLocaleIpcHandlers(() => mainBrowserWindow);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
