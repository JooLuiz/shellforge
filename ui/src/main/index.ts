import { app, BrowserWindow } from "electron";
import fs from "node:fs";
import path from "node:path";
import { registerCustomActionsIpcHandlers } from "./ipc/customActions";
import { registerConfigIpcHandlers } from "./ipc/config";
import { registerProfileIpcHandlers } from "./ipc/profile";
import { registerScheduledTasksIpcHandlers } from "./ipc/scheduledTasks";

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

  const browserWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    browserWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    browserWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  registerConfigIpcHandlers();
  registerProfileIpcHandlers();
  registerScheduledTasksIpcHandlers();
  registerCustomActionsIpcHandlers();
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
