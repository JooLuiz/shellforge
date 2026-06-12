import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { PROFILE_BLOCK_BEGIN, PROFILE_BLOCK_END } from "./profileBlockCore";
import { buildProfileHealthStatus } from "./profileHealth";

describe("profileHealth", () => {
  let tempRoot = "";

  afterEach(() => {
    if (tempRoot && fs.existsSync(tempRoot)) {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
    tempRoot = "";
  });

  it("reports a healthy profile when writable and managed block is present", () => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "shellforge-profile-health-"));
    const profileDirectoryPath = path.join(tempRoot, "Documents", "PowerShell");
    const profilePath = path.join(profileDirectoryPath, "Microsoft.PowerShell_profile.ps1");
    fs.mkdirSync(profileDirectoryPath, { recursive: true });
    fs.writeFileSync(
      profilePath,
      `${PROFILE_BLOCK_BEGIN}\r\n# aliases\r\n${PROFILE_BLOCK_END}\r\n`,
      "utf8",
    );

    const status = buildProfileHealthStatus(
      profilePath,
      fs.readFileSync(profilePath, "utf8"),
      "RemoteSigned",
    );

    expect(status.isHealthy).toBe(true);
    expect(status.issues).toEqual([]);
    expect(status.blockPresent).toBe(true);
  });

  it("flags a missing managed block", () => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "shellforge-profile-health-"));
    const profileDirectoryPath = path.join(tempRoot, "Documents", "PowerShell");
    const profilePath = path.join(profileDirectoryPath, "Microsoft.PowerShell_profile.ps1");
    fs.mkdirSync(profileDirectoryPath, { recursive: true });
    fs.writeFileSync(profilePath, "# empty profile\r\n", "utf8");

    const status = buildProfileHealthStatus(profilePath, "# empty profile\r\n", "RemoteSigned");

    expect(status.isHealthy).toBe(false);
    expect(status.issues.some((issue) => issue.code === "managedBlockMissing")).toBe(true);
  });

  it("flags restricted execution policy", () => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "shellforge-profile-health-"));
    const profileDirectoryPath = path.join(tempRoot, "Documents", "PowerShell");
    const profilePath = path.join(profileDirectoryPath, "Microsoft.PowerShell_profile.ps1");
    fs.mkdirSync(profileDirectoryPath, { recursive: true });
    fs.writeFileSync(profilePath, "", "utf8");

    const status = buildProfileHealthStatus(profilePath, "", "Restricted");

    expect(status.issues.some((issue) => issue.code === "executionPolicyRestricted")).toBe(true);
  });
});
