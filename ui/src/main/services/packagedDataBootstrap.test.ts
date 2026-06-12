import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const appMock = vi.hoisted(() => ({
  isPackaged: true,
  getPath: vi.fn(() => path.join(os.tmpdir(), "shellforge-packaged-test-userdata")),
}));

vi.mock("electron", () => ({
  app: appMock,
}));

import {
  ensurePackagedUserData,
  getPackagedRuntimePath,
  getUserDataRepoRoot,
} from "./packagedDataBootstrap";
import { SHELLFORGE_RUNTIME_VERSION_FILE } from "./shellforgeRuntimeLayout";

function createRuntimeBundle(runtimeRoot: string, version: string): void {
  fs.mkdirSync(path.join(runtimeRoot, "config"), { recursive: true });
  fs.writeFileSync(
    path.join(runtimeRoot, "config", "config-example.json"),
    JSON.stringify({ actionRunner: {}, ui: { predefinedCommands: {}, customActions: {} } }, null, 2),
  );
  fs.mkdirSync(path.join(runtimeRoot, "commands", "action-runner"), { recursive: true });
  fs.writeFileSync(path.join(runtimeRoot, "commands", "action-runner", "action-runner.js"), "// stub");
  fs.mkdirSync(path.join(runtimeRoot, "node_modules"), { recursive: true });
  fs.writeFileSync(path.join(runtimeRoot, "node_modules", "package.json"), "{}");
  fs.mkdirSync(path.join(runtimeRoot, "nodejs"), { recursive: true });
  fs.writeFileSync(path.join(runtimeRoot, "nodejs", "node.exe"), "stub");
  fs.writeFileSync(path.join(runtimeRoot, SHELLFORGE_RUNTIME_VERSION_FILE), `${version}\n`);
}

describe("packagedDataBootstrap", () => {
  let tempRoot: string;
  let bundledRuntimeRoot: string;
  let userDataRoot: string;

  afterEach(() => {
    if (tempRoot && fs.existsSync(tempRoot)) {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }

    vi.restoreAllMocks();
    appMock.isPackaged = true;
  });

  it("seeds writable user data without copying runtime assets on first launch", () => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "shellforge-bootstrap-test-"));
    bundledRuntimeRoot = path.join(tempRoot, "resources", "shellforge-runtime");
    userDataRoot = path.join(tempRoot, "user-data", "shellforge-data");

    createRuntimeBundle(bundledRuntimeRoot, "0.1.5");
    appMock.getPath.mockReturnValue(path.join(tempRoot, "user-data"));

    Object.defineProperty(process, "resourcesPath", {
      configurable: true,
      value: path.join(tempRoot, "resources"),
    });

    ensurePackagedUserData();

    expect(fs.existsSync(path.join(userDataRoot, "config", "config.json"))).toBe(true);
    expect(fs.existsSync(path.join(userDataRoot, "scheduled-tasks"))).toBe(true);
    expect(fs.existsSync(path.join(userDataRoot, ".shellforge-browser-profiles"))).toBe(true);
    expect(fs.existsSync(path.join(userDataRoot, "commands"))).toBe(false);
    expect(fs.existsSync(path.join(userDataRoot, "node_modules"))).toBe(false);
    expect(fs.existsSync(path.join(userDataRoot, "nodejs"))).toBe(false);
    expect(getUserDataRepoRoot()).toBe(userDataRoot);
    expect(getPackagedRuntimePath()).toBe(bundledRuntimeRoot);
  });

  it("preserves config.json and updates runtime version marker on version change", () => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "shellforge-bootstrap-test-"));
    bundledRuntimeRoot = path.join(tempRoot, "resources", "shellforge-runtime");
    userDataRoot = path.join(tempRoot, "user-data", "shellforge-data");

    createRuntimeBundle(bundledRuntimeRoot, "0.1.6");
    fs.mkdirSync(path.join(userDataRoot, "config"), { recursive: true });
    fs.writeFileSync(
      path.join(userDataRoot, "config", "config.json"),
      JSON.stringify({ preserved: true }, null, 2),
    );
    fs.mkdirSync(path.join(userDataRoot, "scheduled-tasks"), { recursive: true });
    fs.writeFileSync(path.join(userDataRoot, SHELLFORGE_RUNTIME_VERSION_FILE), "0.1.5\n");

    appMock.getPath.mockReturnValue(path.join(tempRoot, "user-data"));
    Object.defineProperty(process, "resourcesPath", {
      configurable: true,
      value: path.join(tempRoot, "resources"),
    });

    ensurePackagedUserData();

    expect(JSON.parse(fs.readFileSync(path.join(userDataRoot, "config", "config.json"), "utf8"))).toEqual({
      preserved: true,
    });
    expect(fs.existsSync(path.join(userDataRoot, "commands"))).toBe(false);
    expect(fs.readFileSync(path.join(userDataRoot, SHELLFORGE_RUNTIME_VERSION_FILE), "utf8").trim()).toBe("0.1.6");
  });
});
