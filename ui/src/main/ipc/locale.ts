import { ipcMain, type BrowserWindow } from "electron";
import type { Locale } from "../../shared/i18n/types";
import { isLocale } from "../../shared/i18n";
import {
  sendAppCommand,
  sendLocaleChanged,
  setApplicationMenu,
  type ApplicationMenuHandlers,
} from "../applicationMenu";
import { IPC_CHANNELS } from "./channels";

let currentLocale: Locale = "en";

function createApplicationMenuHandlers(
  getMainWindow: () => BrowserWindow | null,
): ApplicationMenuHandlers {
  return {
    onNewCustomAction: () => {
      sendAppCommand(getMainWindow(), IPC_CHANNELS.appNewCustomAction);
    },
    onNewScheduledTask: () => {
      sendAppCommand(getMainWindow(), IPC_CHANNELS.appNewScheduledTask);
    },
    onSetLocale: (locale) => {
      currentLocale = locale;
      sendLocaleChanged(getMainWindow(), locale);
      setApplicationMenu(currentLocale, createApplicationMenuHandlers(getMainWindow));
    },
  };
}

export function registerLocaleIpcHandlers(
  getMainWindow: () => BrowserWindow | null,
): void {
  ipcMain.handle(IPC_CHANNELS.localeSync, (_event, localeCandidate: unknown) => {
    if (!isLocale(localeCandidate)) {
      throw new Error(`Invalid locale: ${String(localeCandidate)}`);
    }
    currentLocale = localeCandidate;
    setApplicationMenu(currentLocale, createApplicationMenuHandlers(getMainWindow));
  });

  ipcMain.handle(IPC_CHANNELS.localeGet, () => currentLocale);

  setApplicationMenu(currentLocale, createApplicationMenuHandlers(getMainWindow));
}

export function getCurrentApplicationLocale(): Locale {
  return currentLocale;
}
