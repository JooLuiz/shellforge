import { ipcMain } from "electron";
import type { ScheduledTaskInput } from "../../shared/types";
import { IPC_CHANNELS } from "./channels";
import {
  deleteScheduledTask,
  listScheduledTasks,
  saveScheduledTask,
  toggleScheduledTask,
} from "../services/scheduledTasksService";
import { getScheduledTaskPrivilegesStatus } from "../services/windowsPrivileges";

export function registerScheduledTasksIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.scheduledTasksList, async () => {
    return await listScheduledTasks();
  });

  ipcMain.handle(IPC_CHANNELS.scheduledTasksSave, async (_event, input: ScheduledTaskInput) => {
    return await saveScheduledTask(input);
  });

  ipcMain.handle(IPC_CHANNELS.scheduledTasksDelete, (_event, fileName: string) => {
    deleteScheduledTask(fileName);
  });

  ipcMain.handle(
    IPC_CHANNELS.scheduledTasksToggle,
    async (_event, fileName: string, isEnabled: boolean) => {
      await toggleScheduledTask(fileName, isEnabled);
    },
  );

  ipcMain.handle(IPC_CHANNELS.scheduledTasksPrivileges, () => {
    return getScheduledTaskPrivilegesStatus();
  });
}
