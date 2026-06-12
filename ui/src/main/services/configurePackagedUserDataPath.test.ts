import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const appMock = vi.hoisted(() => ({
  isPackaged: true,
  getPath: vi.fn((name: string) => {
    if (name === "appData") {
      return path.join(os.tmpdir(), "shellforge-appdata");
    }

    throw new Error(`Unexpected getPath call: ${name}`);
  }),
  setPath: vi.fn(),
}));

vi.mock("electron", () => ({
  app: appMock,
}));

import { configurePackagedUserDataPath } from "./configurePackagedUserDataPath";

describe("configurePackagedUserDataPath", () => {
  afterEach(() => {
    vi.clearAllMocks();
    appMock.isPackaged = true;
  });

  it("overrides userData to APPDATA/ShellForge when packaged", () => {
    configurePackagedUserDataPath();

    expect(appMock.getPath).toHaveBeenCalledWith("appData");
    expect(appMock.setPath).toHaveBeenCalledWith(
      "userData",
      path.join(os.tmpdir(), "shellforge-appdata", "ShellForge"),
    );
  });

  it("does not override userData in dev mode", () => {
    appMock.isPackaged = false;

    configurePackagedUserDataPath();

    expect(appMock.getPath).not.toHaveBeenCalled();
    expect(appMock.setPath).not.toHaveBeenCalled();
  });
});
