import { ipcMain } from "electron";
import { readConfig } from "../services/configService";
import { listBrowserProfileKeys } from "../services/browserProfilesService";
import { IPC_CHANNELS } from "./channels";

export function registerBrowserProfilesIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.browserProfilesList, () => {
    const config = readConfig();
    return listBrowserProfileKeys(config);
  });
}
