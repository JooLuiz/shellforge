import { ipcMain } from "electron";
import { IPC_CHANNELS } from "./channels";
import { getProfileStatus, regenerateProfileManagedBlock } from "../services/profileBlock";
import { readConfig } from "../services/configService";

export function registerProfileIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.profileStatus, () => {
    return getProfileStatus();
  });

  ipcMain.handle(IPC_CHANNELS.profileRegenerate, () => {
    const config = readConfig();
    regenerateProfileManagedBlock(config);
  });
}
