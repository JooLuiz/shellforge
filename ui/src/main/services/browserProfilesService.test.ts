import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AppConfig } from "../../shared/types";
import { listBrowserProfileKeys } from "./browserProfilesService";

const repoPathsModule = await import("./repoPaths");

function createTempRepoRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "shellforge-browser-profiles-test-"));
}

function createConfig(profileKeys: string[]): AppConfig {
  const actionRunner = Object.fromEntries(
    profileKeys.map((profileKey, index) => [
      `action-${index}`,
      { steps: [], browserProfile: profileKey },
    ]),
  );

  return {
    actionRunner,
    ui: {
      predefinedCommands: {
        reinitialize: { enabled: true, alias: "reinitialize" },
        touch: { enabled: true, alias: "touch" },
        "action-runner": { enabled: true, alias: "action-runner" },
      },
      customActions: {},
    },
  };
}

describe("listBrowserProfileKeys", () => {
  let tempRepoRoot = "";

  beforeEach(() => {
    tempRepoRoot = createTempRepoRoot();
    vi.spyOn(repoPathsModule, "getRepoPaths").mockReturnValue({
      userDataRoot: tempRepoRoot,
      runtimeRoot: tempRepoRoot,
      configPath: path.join(tempRepoRoot, "config", "config.json"),
      scheduledTasksDir: path.join(tempRepoRoot, "scheduled-tasks"),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(tempRepoRoot, { recursive: true, force: true });
  });

  it("returns config-only profile keys when profiles directory is missing", () => {
    const config = createConfig(["clockify", "github"]);

    expect(listBrowserProfileKeys(config)).toEqual(["clockify", "github"]);
  });

  it("returns filesystem profile keys unioned with config values", () => {
    const profilesDirectoryPath = path.join(tempRepoRoot, ".shellforge-browser-profiles");
    fs.mkdirSync(path.join(profilesDirectoryPath, "clockify"), { recursive: true });
    fs.mkdirSync(path.join(profilesDirectoryPath, "jira"), { recursive: true });
    fs.writeFileSync(path.join(profilesDirectoryPath, "readme.txt"), "ignore me");

    const config = createConfig(["clockify", "github"]);

    expect(listBrowserProfileKeys(config)).toEqual(["clockify", "github", "jira"]);
  });

  it("deduplicates and sorts profile keys", () => {
    const profilesDirectoryPath = path.join(tempRepoRoot, ".shellforge-browser-profiles");
    fs.mkdirSync(path.join(profilesDirectoryPath, "zebra"), { recursive: true });
    fs.mkdirSync(path.join(profilesDirectoryPath, "alpha"), { recursive: true });

    const config = createConfig(["zebra", "beta"]);

    expect(listBrowserProfileKeys(config)).toEqual(["alpha", "beta", "zebra"]);
  });

  it("ignores blank browserProfile values in config", () => {
    const config: AppConfig = {
      actionRunner: {
        "blank-profile": { steps: [], browserProfile: "   " },
        "valid-profile": { steps: [], browserProfile: "clockify" },
      },
      ui: {
        predefinedCommands: {
          reinitialize: { enabled: true, alias: "reinitialize" },
          touch: { enabled: true, alias: "touch" },
          "action-runner": { enabled: true, alias: "action-runner" },
        },
        customActions: {},
      },
    };

    expect(listBrowserProfileKeys(config)).toEqual(["clockify"]);
  });
});
