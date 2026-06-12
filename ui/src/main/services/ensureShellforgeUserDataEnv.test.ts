import { execFileSync } from "node:child_process";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("node:child_process", () => ({
  execFileSync: vi.fn(),
}));

import {
  ensureShellforgeUserDataEnvVar,
  readWindowsUserEnvironmentVariable,
  SHELLFORGE_USER_DATA_ENV_VAR,
  setWindowsUserEnvironmentVariable,
} from "./ensureShellforgeUserDataEnv";

describe("ensureShellforgeUserDataEnv", () => {
  const execFileSyncMock = vi.mocked(execFileSync);
  const originalPlatform = process.platform;
  const userDataRepoRoot = "C:\\Users\\test\\AppData\\Roaming\\ShellForge\\shellforge-data";

  afterEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(process, "platform", { value: originalPlatform });
    delete process.env[SHELLFORGE_USER_DATA_ENV_VAR];
  });

  it("reads a User environment variable via PowerShell", () => {
    execFileSyncMock.mockReturnValue(`${userDataRepoRoot}\r\n`);

    expect(readWindowsUserEnvironmentVariable(SHELLFORGE_USER_DATA_ENV_VAR)).toBe(userDataRepoRoot);
    expect(execFileSyncMock).toHaveBeenCalledWith(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "[Environment]::GetEnvironmentVariable('SHELLFORGE_USER_DATA','User')",
      ],
      { encoding: "utf8", windowsHide: true },
    );
  });

  it("returns null when the User environment variable is unset", () => {
    execFileSyncMock.mockReturnValue("\r\n");

    expect(readWindowsUserEnvironmentVariable(SHELLFORGE_USER_DATA_ENV_VAR)).toBeNull();
  });

  it("sets a User environment variable via PowerShell", () => {
    execFileSyncMock.mockReturnValue("");

    setWindowsUserEnvironmentVariable(SHELLFORGE_USER_DATA_ENV_VAR, userDataRepoRoot);

    expect(execFileSyncMock).toHaveBeenCalledWith(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        `[Environment]::SetEnvironmentVariable('SHELLFORGE_USER_DATA','${userDataRepoRoot}','User')`,
      ],
      { encoding: "utf8", windowsHide: true },
    );
  });

  it("creates SHELLFORGE_USER_DATA when missing and mirrors it into the current process", () => {
    Object.defineProperty(process, "platform", { value: "win32" });
    execFileSyncMock
      .mockReturnValueOnce("\r\n")
      .mockReturnValueOnce("");

    ensureShellforgeUserDataEnvVar(userDataRepoRoot);

    expect(process.env[SHELLFORGE_USER_DATA_ENV_VAR]).toBe(userDataRepoRoot);
    expect(execFileSyncMock).toHaveBeenCalledTimes(2);
  });

  it("does not overwrite an existing User environment variable", () => {
    Object.defineProperty(process, "platform", { value: "win32" });
    execFileSyncMock.mockReturnValue(`${userDataRepoRoot}\r\n`);

    ensureShellforgeUserDataEnvVar("C:\\other\\path\\shellforge-data");

    expect(execFileSyncMock).toHaveBeenCalledTimes(1);
    expect(process.env[SHELLFORGE_USER_DATA_ENV_VAR]).toBeUndefined();
  });

  it("no-ops on non-Windows platforms", () => {
    Object.defineProperty(process, "platform", { value: "darwin" });

    ensureShellforgeUserDataEnvVar(userDataRepoRoot);

    expect(execFileSyncMock).not.toHaveBeenCalled();
    expect(process.env[SHELLFORGE_USER_DATA_ENV_VAR]).toBeUndefined();
  });
});
