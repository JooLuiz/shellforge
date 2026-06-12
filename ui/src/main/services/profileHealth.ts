import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { ProfileIssue, ProfileStatus } from "../../shared/types";
import { findManagedBlock } from "./profileBlockCore";
import { getProfilePath } from "./profilePath";

const RESTRICTED_EXECUTION_POLICIES = new Set(["Restricted", "AllSigned"]);

function readProfileContent(profilePath: string): string {
  if (!fs.existsSync(profilePath)) {
    return "";
  }

  return fs.readFileSync(profilePath, "utf8");
}

function readCurrentUserExecutionPolicy(): string | null {
  try {
    const executionPolicy = execFileSync(
      "powershell",
      ["-NoProfile", "-Command", "(Get-ExecutionPolicy -Scope CurrentUser).ToString()"],
      { encoding: "utf8" },
    ).trim();

    return executionPolicy.length > 0 ? executionPolicy : null;
  } catch {
    return null;
  }
}

function canWriteDirectory(directoryPath: string): boolean {
  try {
    fs.accessSync(directoryPath, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function canWriteProfileFile(profilePath: string, profileDirectoryPath: string): boolean {
  if (fs.existsSync(profilePath)) {
    try {
      fs.accessSync(profilePath, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  const probeFilePath = path.join(profileDirectoryPath, ".shellforge-profile-write-probe");
  try {
    fs.writeFileSync(probeFilePath, "", "utf8");
    fs.rmSync(probeFilePath, { force: true });
    return true;
  } catch {
    return false;
  }
}

function isExecutionPolicyRestricted(executionPolicy: string | null): boolean {
  if (!executionPolicy) {
    return false;
  }

  return RESTRICTED_EXECUTION_POLICIES.has(executionPolicy);
}

export function buildProfileHealthStatus(
  profilePath: string,
  profileContent: string,
  currentUserExecutionPolicy: string | null,
): ProfileStatus {
  const issues: ProfileIssue[] = [];
  const profileDirectoryPath = path.dirname(profilePath);
  const blockPresent = Boolean(findManagedBlock(profileContent));

  if (!canWriteDirectory(profileDirectoryPath)) {
    issues.push({
      code: "profileDirectoryNotWritable",
      message: `ShellForge cannot write to the profile folder: ${profileDirectoryPath}`,
      remediation:
        "Fix folder permissions, disable read-only on the folder, or resolve OneDrive/sync restrictions on your Documents folder.",
    });
  }

  if (!canWriteProfileFile(profilePath, profileDirectoryPath)) {
    issues.push({
      code: "profileFileNotWritable",
      message: `ShellForge cannot update your PowerShell profile file: ${profilePath}`,
      remediation:
        "Remove the read-only flag on the profile file or adjust file permissions so your user account can edit it.",
    });
  }

  if (isExecutionPolicyRestricted(currentUserExecutionPolicy)) {
    issues.push({
      code: "executionPolicyRestricted",
      message: `PowerShell execution policy for CurrentUser is "${currentUserExecutionPolicy}", which can block profile scripts.`,
      remediation:
        'Run in PowerShell: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned. This allows local profile scripts (including ShellForge aliases) to load.',
    });
  }

  if (!blockPresent) {
    issues.push({
      code: "managedBlockMissing",
      message: "The ShellForge managed block is missing from your PowerShell profile.",
      remediation:
        "Save any change in Pre-defined Commands or Custom Actions to regenerate the profile block, or click Regenerate profile block below.",
    });
  }

  return {
    profilePath,
    blockPresent,
    currentUserExecutionPolicy,
    issues,
    isHealthy: issues.length === 0,
  };
}

export function getProfileHealthStatus(): ProfileStatus {
  try {
    const profilePath = getProfilePath();
    const profileContent = readProfileContent(profilePath);
    const currentUserExecutionPolicy = readCurrentUserExecutionPolicy();

    return buildProfileHealthStatus(profilePath, profileContent, currentUserExecutionPolicy);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to resolve PowerShell profile path.";

    return {
      profilePath: "",
      blockPresent: false,
      currentUserExecutionPolicy: null,
      issues: [
        {
          code: "profilePathUnresolved",
          message,
          remediation:
            "Restart ShellForge. If the issue persists, open PowerShell once manually and confirm that $PROFILE.CurrentUserCurrentHost resolves to a valid path.",
        },
      ],
      isHealthy: false,
    };
  }
}

export function assertProfileWritableForRegeneration(profileStatus: ProfileStatus): void {
  const blockingIssue = profileStatus.issues.find((issue) =>
    issue.code === "profileDirectoryNotWritable" ||
    issue.code === "profileFileNotWritable" ||
    issue.code === "profilePathUnresolved",
  );

  if (blockingIssue) {
    throw new Error(blockingIssue.message);
  }
}
