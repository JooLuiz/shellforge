import { ipcMain, shell } from "electron";
import path from "node:path";
import { IPC_CHANNELS } from "./channels";
import { readConfig } from "../services/configService";
import { getProfilePath, getProfileStatus, regenerateProfileManagedBlock } from "../services/profileBlock";

export function registerProfileIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.profileStatus, () => {
    return getProfileStatus();
  });

  ipcMain.handle(IPC_CHANNELS.profileRegenerate, () => {
    const config = readConfig();
    regenerateProfileManagedBlock(config);
  });

  ipcMain.handle(IPC_CHANNELS.profileOpenFolder, () => {
    const profilePath = getProfilePath();
    const profileDirectoryPath = path.dirname(profilePath);
    void shell.openPath(profileDirectoryPath);
  });
}
