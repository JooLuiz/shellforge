import { execFileSync } from "node:child_process";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("node:child_process", () => ({
  execFileSync: vi.fn(),
}));

import { isRunningAsAdministrator } from "./windowsPrivileges";

describe("windowsPrivileges", () => {
  const execFileSyncMock = vi.mocked(execFileSync);
  const originalPlatform = process.platform;

  afterEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(process, "platform", { value: originalPlatform });
  });

  it("returns true on non-Windows platforms", () => {
    Object.defineProperty(process, "platform", { value: "darwin" });

    expect(isRunningAsAdministrator()).toBe(true);
    expect(execFileSyncMock).not.toHaveBeenCalled();
  });

  it("returns true when PowerShell reports administrator role", () => {
    Object.defineProperty(process, "platform", { value: "win32" });
    execFileSyncMock.mockReturnValue("True\r\n");

    expect(isRunningAsAdministrator()).toBe(true);
  });

  it("returns false when PowerShell reports non-administrator role", () => {
    Object.defineProperty(process, "platform", { value: "win32" });
    execFileSyncMock.mockReturnValue("False\r\n");

    expect(isRunningAsAdministrator()).toBe(false);
  });

  it("returns false when the privilege check command fails", () => {
    Object.defineProperty(process, "platform", { value: "win32" });
    execFileSyncMock.mockImplementation(() => {
      throw new Error("Access denied");
    });

    expect(isRunningAsAdministrator()).toBe(false);
  });
});
