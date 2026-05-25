import { ipcMain } from "electron";
import type { ScheduledTaskInput } from "../../shared/types";
import { IPC_CHANNELS } from "./channels";
import {
  deleteScheduledTask,
  listScheduledTasks,
  saveScheduledTask,
  toggleScheduledTask,
} from "../services/scheduledTasksService";

export function registerScheduledTasksIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.scheduledTasksList, () => {
    return listScheduledTasks();
  });

  ipcMain.handle(IPC_CHANNELS.scheduledTasksSave, (_event, input: ScheduledTaskInput) => {
    return saveScheduledTask(input);
  });

  ipcMain.handle(IPC_CHANNELS.scheduledTasksDelete, (_event, fileName: string) => {
    deleteScheduledTask(fileName);
  });

  ipcMain.handle(
    IPC_CHANNELS.scheduledTasksToggle,
    (_event, fileName: string, isEnabled: boolean) => {
      toggleScheduledTask(fileName, isEnabled);
    }
  );
}
