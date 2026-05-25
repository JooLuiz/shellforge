import { ipcMain } from "electron";
import type { RunCustomActionInput } from "../../shared/types";
import { IPC_CHANNELS } from "./channels";
import { runCustomAction } from "../services/customActionsService";

export function registerCustomActionsIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.customActionsRun, (_event, input: RunCustomActionInput) => {
    return runCustomAction(input);
  });
}
