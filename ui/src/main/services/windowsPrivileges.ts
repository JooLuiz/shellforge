import { execFileSync } from "node:child_process";

const ADMIN_CHECK_COMMAND =
  "([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)";

export function isRunningAsAdministrator(): boolean {
  if (process.platform !== "win32") {
    return true;
  }

  try {
    const output = execFileSync(
      "powershell",
      ["-NoProfile", "-Command", ADMIN_CHECK_COMMAND],
      {
        encoding: "utf8",
        stdio: "pipe",
        windowsHide: true,
      },
    );
    return output.trim().toLowerCase() === "true";
  } catch {
    return false;
  }
}

export function getScheduledTaskPrivilegesStatus(): { isAdministrator: boolean } {
  return { isAdministrator: isRunningAsAdministrator() };
}
