import { execFileSync } from "node:child_process";

export const SHELLFORGE_USER_DATA_ENV_VAR = "SHELLFORGE_USER_DATA";

function escapePowerShellSingleQuotedString(value: string): string {
  return value.replace(/'/g, "''");
}

export function runPowerShellCommand(script: string): string {
  return execFileSync(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-Command", script],
    { encoding: "utf8", windowsHide: true },
  ).trim();
}

export function readWindowsUserEnvironmentVariable(variableName: string): string | null {
  const escapedVariableName = escapePowerShellSingleQuotedString(variableName);
  const output = runPowerShellCommand(
    `[Environment]::GetEnvironmentVariable('${escapedVariableName}','User')`,
  );

  return output.length > 0 ? output : null;
}

export function setWindowsUserEnvironmentVariable(variableName: string, value: string): void {
  const escapedVariableName = escapePowerShellSingleQuotedString(variableName);
  const escapedValue = escapePowerShellSingleQuotedString(value);
  runPowerShellCommand(
    `[Environment]::SetEnvironmentVariable('${escapedVariableName}','${escapedValue}','User')`,
  );
}

export function ensureShellforgeUserDataEnvVar(userDataRepoRoot: string): void {
  if (process.platform !== "win32") {
    return;
  }

  const trimmedUserDataRepoRoot = userDataRepoRoot.trim();
  if (trimmedUserDataRepoRoot.length === 0) {
    throw new Error("User data repo root cannot be empty when ensuring SHELLFORGE_USER_DATA.");
  }

  const existingValue = readWindowsUserEnvironmentVariable(SHELLFORGE_USER_DATA_ENV_VAR);
  if (existingValue !== null && existingValue.trim().length > 0) {
    return;
  }

  setWindowsUserEnvironmentVariable(SHELLFORGE_USER_DATA_ENV_VAR, trimmedUserDataRepoRoot);
  process.env[SHELLFORGE_USER_DATA_ENV_VAR] = trimmedUserDataRepoRoot;
}
