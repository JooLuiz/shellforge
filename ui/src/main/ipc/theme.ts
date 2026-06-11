import { BrowserWindow, ipcMain, nativeTheme } from "electron";
import {
  getWindowBackgroundColor,
  isThemeMode,
  toNativeThemeSource,
  type ThemeMode,
} from "../../shared/themeBridge";
import { IPC_CHANNELS } from "./channels";

export function applyNativeWindowTheme(
  browserWindow: BrowserWindow | null,
  theme: ThemeMode
): void {
  nativeTheme.themeSource = toNativeThemeSource(theme);
  browserWindow?.setBackgroundColor(getWindowBackgroundColor(theme));
}

export function registerThemeIpcHandlers(
  getMainWindow: () => BrowserWindow | null
): void {
  ipcMain.handle(IPC_CHANNELS.themeSet, (_event, themeCandidate: unknown) => {
    if (!isThemeMode(themeCandidate)) {
      throw new Error(`Invalid theme mode: ${String(themeCandidate)}`);
    }

    applyNativeWindowTheme(getMainWindow(), themeCandidate);
  });
}
