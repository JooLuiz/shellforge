import { contextBridge, ipcRenderer } from "electron";
import type { AppApi, AppConfig, RunCustomActionInput, ScheduledTaskInput } from "../shared/types";
import { IPC_CHANNELS } from "../main/ipc/channels";

const api: AppApi = {
  config: {
    read: async () => ipcRenderer.invoke(IPC_CHANNELS.configRead),
    write: async (config: AppConfig) => ipcRenderer.invoke(IPC_CHANNELS.configWrite, config),
  },
  profile: {
    status: async () => ipcRenderer.invoke(IPC_CHANNELS.profileStatus),
    regenerate: async () => ipcRenderer.invoke(IPC_CHANNELS.profileRegenerate),
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
};

contextBridge.exposeInMainWorld("api", api);
