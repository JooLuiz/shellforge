import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const tempDirectories: string[] = [];

afterEach(() => {
  tempDirectories.splice(0).forEach((directoryPath) => {
    fs.rmSync(directoryPath, { recursive: true, force: true });
  });
  vi.resetModules();
});

describe("configService integration", () => {
  it("reads and writes config through the service layer", async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "shellforge-config-"));
    tempDirectories.push(tempRoot);

    vi.doMock("./repoPaths", () => ({
      getRepoPaths: () => ({
        configPath: path.join(tempRoot, "config.json"),
        runtimeRoot: tempRoot,
      }),
    }));

    vi.doMock("../../shared/defaults", async () => {
      const actual = await vi.importActual<typeof import("../../shared/defaults")>(
        "../../shared/defaults",
      );
      return actual;
    });

    const sampleConfig = {
      actionRunner: {
        demo: {
          steps: [{ action: "wait", ms: 1 }],
        },
      },
      ui: {
        predefinedCommands: {},
        customActions: {
          demo: { availableOnCLI: true, aliases: ["demo"] },
        },
      },
    };

    fs.writeFileSync(
      path.join(tempRoot, "config.json"),
      `${JSON.stringify(sampleConfig, null, 2)}\n`,
      "utf8",
    );

    vi.doMock("node:module", () => ({
      createRequire: () =>
        () => ({
          normalizeSteps: () => undefined,
        }),
    }));

    const { readConfig, writeConfig } = await import("./configService");
    const loadedConfig = readConfig();
    expect(loadedConfig.actionRunner.demo).toBeDefined();

    loadedConfig.ui.customActions.demo.availableOnCLI = false;
    writeConfig(loadedConfig);

    const persisted = JSON.parse(fs.readFileSync(path.join(tempRoot, "config.json"), "utf8")) as {
      ui: { customActions: { demo: { availableOnCLI: boolean } } };
    };
    expect(persisted.ui.customActions.demo.availableOnCLI).toBe(false);
  });
});
