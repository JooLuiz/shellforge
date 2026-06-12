import { ipcMain } from "electron";
import type { AppConfig } from "../../shared/types";
import { IPC_CHANNELS } from "./channels";
import { readConfig, writeConfig } from "../services/configService";

export function registerConfigIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.configRead, () => {
    return readConfig();
  });

  ipcMain.handle(IPC_CHANNELS.configWrite, (_event, config: AppConfig) => {
    writeConfig(config);
  });
}
