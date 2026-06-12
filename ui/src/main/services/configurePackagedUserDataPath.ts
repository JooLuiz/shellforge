import { app } from "electron";
import path from "node:path";
import { SHELLFORGE_APP_DATA_DIR_NAME } from "./shellforgeRuntimeLayout";

export function configurePackagedUserDataPath(): void {
  if (!app.isPackaged) {
    return;
  }

  const shellForgeUserDataPath = path.join(
    app.getPath("appData"),
    SHELLFORGE_APP_DATA_DIR_NAME,
  );
  app.setPath("userData", shellForgeUserDataPath);
}
