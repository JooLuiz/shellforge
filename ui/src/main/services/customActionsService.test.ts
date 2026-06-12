import { EventEmitter } from "node:events";
import { spawn, type ChildProcess } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readConfig } from "./configService";
import { getRepoPaths, resolvePredefinedCommandBatPath } from "./repoPaths";
import { runCustomAction } from "./customActionsService";

vi.mock("node:child_process", () => ({
  spawn: vi.fn(),
}));

vi.mock("./configService", () => ({
  readConfig: vi.fn(),
}));

vi.mock("./repoPaths", () => ({
  getRepoPaths: vi.fn(),
  resolvePredefinedCommandBatPath: vi.fn(),
}));

class MockChildProcess extends EventEmitter {
  stdout = new EventEmitter();

  stderr = new EventEmitter();
}

describe("customActionsService", () => {
  const spawnMock = vi.mocked(spawn);
  const readConfigMock = vi.mocked(readConfig);
  const getRepoPathsMock = vi.mocked(getRepoPaths);
  const resolvePredefinedCommandBatPathMock = vi.mocked(resolvePredefinedCommandBatPath);

  beforeEach(() => {
    vi.clearAllMocks();
    getRepoPathsMock.mockReturnValue({
      userDataRoot: "C:\\user-data\\shellforge-data",
      runtimeRoot: "C:\\runtime\\shellforge-runtime",
      configPath: "C:\\user-data\\shellforge-data\\config\\config.json",
      scheduledTasksDir: "C:\\user-data\\shellforge-data\\scheduled-tasks",
    });
    resolvePredefinedCommandBatPathMock.mockReturnValue(
      "C:\\runtime\\shellforge-runtime\\commands\\action-runner\\action-runner.bat",
    );
    readConfigMock.mockReturnValue({
      actionRunner: {
        "lancar-horas": {
          steps: [{ action: "wait", ms: 1 }],
        },
      },
      ui: {
        predefinedCommands: {},
        customActions: {},
      },
    } as ReturnType<typeof readConfig>);
  });

  it("spawns action-runner from the bat directory while keeping user data env", async () => {
    const childProcess = new MockChildProcess();
    spawnMock.mockReturnValue(childProcess as unknown as ChildProcess);

    const runPromise = runCustomAction({
      actionName: "lancar-horas",
      args: { message: "hello" },
    });

    childProcess.stdout.emit("data", "done");
    childProcess.emit("close", 0);

    await expect(runPromise).resolves.toEqual({
      stdout: "done",
      stderr: "",
    });

    expect(spawnMock).toHaveBeenCalledWith(
      "C:\\runtime\\shellforge-runtime\\commands\\action-runner\\action-runner.bat",
      ["--action=lancar-horas", "--arg.message=hello"],
      expect.objectContaining({
        cwd: "C:\\runtime\\shellforge-runtime\\commands\\action-runner",
        shell: true,
        windowsHide: true,
        env: expect.objectContaining({
          SHELLFORGE_USER_DATA: "C:\\user-data\\shellforge-data",
        }),
      }),
    );
  });

  it("rejects when action-runner exits with a non-zero code", async () => {
    const childProcess = new MockChildProcess();
    spawnMock.mockReturnValue(childProcess as unknown as ChildProcess);

    const runPromise = runCustomAction({
      actionName: "lancar-horas",
      args: {},
    });

    childProcess.stderr.emit("data", "spawn failed");
    childProcess.emit("close", 1);

    await expect(runPromise).rejects.toThrow("Action runner failed with exit code 1.");
  });
});
