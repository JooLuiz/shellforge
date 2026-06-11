import { contextBridge, ipcRenderer } from "electron";
import type { Locale } from "../shared/i18n/types";
import type { ThemeMode } from "../shared/themeBridge";
import type { AppApi, AppConfig, RunCustomActionInput, ScheduledTaskInput } from "../shared/types";
import { IPC_CHANNELS } from "../main/ipc/channels";
import { isLocale } from "../shared/i18n";

function subscribeIpcEvent<T>(
  channel: string,
  callback: (payload: T) => void,
  validator: (payload: unknown) => payload is T,
): () => void {
  const listener = (_event: Electron.IpcRendererEvent, payload: unknown): void => {
    if (validator(payload)) {
      callback(payload);
    }
  };
  ipcRenderer.on(channel, listener);
  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
}

const api: AppApi = {
  config: {
    read: async () => ipcRenderer.invoke(IPC_CHANNELS.configRead),
    write: async (config: AppConfig) => ipcRenderer.invoke(IPC_CHANNELS.configWrite, config),
  },
  profile: {
    status: async () => ipcRenderer.invoke(IPC_CHANNELS.profileStatus),
    regenerate: async () => ipcRenderer.invoke(IPC_CHANNELS.profileRegenerate),
    openFolder: async () => ipcRenderer.invoke(IPC_CHANNELS.profileOpenFolder),
  },
  scheduledTasks: {
    list: async () => ipcRenderer.invoke(IPC_CHANNELS.scheduledTasksList),
    save: async (input: ScheduledTaskInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.scheduledTasksSave, input),
    delete: async (fileName: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.scheduledTasksDelete, fileName),
    toggle: async (fileName: string, isEnabled: boolean) =>
      ipcRenderer.invoke(IPC_CHANNELS.scheduledTasksToggle, fileName, isEnabled),
  },
  customActions: {
    run: async (input: RunCustomActionInput) => ipcRenderer.invoke(IPC_CHANNELS.customActionsRun, input),
  },
  browserProfiles: {
    list: async () => ipcRenderer.invoke(IPC_CHANNELS.browserProfilesList),
  },
  theme: {
    set: async (theme: ThemeMode) => ipcRenderer.invoke(IPC_CHANNELS.themeSet, theme),
  },
  locale: {
    sync: async (locale: Locale) => ipcRenderer.invoke(IPC_CHANNELS.localeSync, locale),
    get: async () => ipcRenderer.invoke(IPC_CHANNELS.localeGet),
    onChanged: (callback) =>
      subscribeIpcEvent<Locale>("locale:changed", callback, isLocale),
  },
  app: {
    onNewCustomAction: (callback) => {
      const listener = (): void => {
        callback();
      };
      ipcRenderer.on(IPC_CHANNELS.appNewCustomAction, listener);
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.appNewCustomAction, listener);
      };
    },
    onNewScheduledTask: (callback) => {
      const listener = (): void => {
        callback();
      };
      ipcRenderer.on(IPC_CHANNELS.appNewScheduledTask, listener);
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.appNewScheduledTask, listener);
      };
    },
  },
};

contextBridge.exposeInMainWorld("api", api);
