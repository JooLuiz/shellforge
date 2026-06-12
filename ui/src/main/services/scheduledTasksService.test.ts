import { execFile, execFileSync, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ScheduledTaskInput } from "../../shared/types";
import { listScheduledTaskRecords, parseScheduledTaskContent } from "./ps1Parser";
import { getRepoPaths } from "./repoPaths";
import {
  buildScheduledTaskCommandArgs,
  listScheduledTasks,
  saveScheduledTask,
  toggleScheduledTask,
} from "./scheduledTasksService";

vi.mock("node:child_process", () => ({
  execFile: vi.fn(),
  execFileSync: vi.fn(),
}));

vi.mock("node:fs", () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    unlinkSync: vi.fn(),
  },
}));

vi.mock("./ps1Parser", () => ({
  listScheduledTaskRecords: vi.fn(),
  parseScheduledTaskContent: vi.fn(),
}));

vi.mock("./repoPaths", () => ({
  getRepoPaths: vi.fn(),
}));

vi.mock("./configService", () => ({
  readConfig: vi.fn(() => ({
    actionRunner: {},
    ui: {
      predefinedCommands: {},
      customActions: {},
    },
  })),
}));

const BASE_TASK_INPUT: ScheduledTaskInput = {
  actionName: "BaterPonto",
  triggerTimes: ["08:00"],
  weekdays: ["Monday"],
  command: "bater-ponto",
};

describe("scheduledTasksService", () => {
  const execFileMock = vi.mocked(execFile);
  const execFileSyncMock = vi.mocked(execFileSync);
  const existsSyncMock = vi.mocked(fs.existsSync);
  const readFileSyncMock = vi.mocked(fs.readFileSync);
  const writeFileSyncMock = vi.mocked(fs.writeFileSync);
  const unlinkSyncMock = vi.mocked(fs.unlinkSync);
  const listScheduledTaskRecordsMock = vi.mocked(listScheduledTaskRecords);
  const parseScheduledTaskContentMock = vi.mocked(parseScheduledTaskContent);
  const getRepoPathsMock = vi.mocked(getRepoPaths);

  function mockExecFileSuccess(output: string): void {
    execFileMock.mockImplementation((_file, _args, optionsOrCallback, maybeCallback) => {
      const callback =
        typeof optionsOrCallback === "function" ? optionsOrCallback : maybeCallback;
      callback?.(null, output, "");
      return {} as ChildProcess;
    });
  }

  function mockExecFileFailure(message: string): void {
    execFileMock.mockImplementation((_file, _args, optionsOrCallback, maybeCallback) => {
      const callback =
        typeof optionsOrCallback === "function" ? optionsOrCallback : maybeCallback;
      callback?.(new Error(message), "", "");
      return {} as ChildProcess;
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    getRepoPathsMock.mockReturnValue({
      userDataRoot: "C:\\repo",
      runtimeRoot: "C:\\runtime",
      configPath: "C:\\repo\\config\\config.json",
      scheduledTasksDir: "C:\\repo\\scheduled-tasks",
    });
    existsSyncMock.mockReturnValue(true);
    execFileSyncMock.mockImplementation(() => "");
  });

  it("builds PowerShell args for both enable and disable flows", () => {
    const enableArgs = buildScheduledTaskCommandArgs("C:\\repo\\scheduled-tasks\\setup-x.ps1", true);
    const disableArgs = buildScheduledTaskCommandArgs("C:\\repo\\scheduled-tasks\\setup-x.ps1", false);

    expect(enableArgs).toEqual([
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      "C:\\repo\\scheduled-tasks\\setup-x.ps1",
    ]);
    expect(disableArgs).toEqual([
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      "C:\\repo\\scheduled-tasks\\setup-x.ps1",
      "-Remove",
    ]);
  });

  it("merges parsed task files with current OS scheduled task state", async () => {
    listScheduledTaskRecordsMock.mockReturnValue([
      {
        fileName: "setup-bater-ponto-task.ps1",
        actionName: "BaterPonto",
        triggerTimes: ["08:00"],
        weekdays: ["Monday"],
        command: "bater-ponto",
        isEnabled: false,
      },
      {
        fileName: "setup-outro-task.ps1",
        actionName: "Outro",
        triggerTimes: ["10:00"],
        weekdays: ["Tuesday"],
        command: "outro",
        isEnabled: false,
      },
    ]);
    mockExecFileSuccess("BaterPonto\r\nSomeOtherTask\r\n");

    const records = await listScheduledTasks();

    expect(records).toHaveLength(2);
    expect(records[0].isEnabled).toBe(true);
    expect(records[1].isEnabled).toBe(false);
  });

  it("falls back to disabled status when task listing command fails", async () => {
    listScheduledTaskRecordsMock.mockReturnValue([
      {
        fileName: "setup-bater-ponto-task.ps1",
        actionName: "BaterPonto",
        triggerTimes: ["08:00"],
        weekdays: ["Monday"],
        command: "bater-ponto",
        isEnabled: false,
      },
    ]);
    mockExecFileFailure("Access denied");

    const records = await listScheduledTasks();

    expect(records).toHaveLength(1);
    expect(records[0].isEnabled).toBe(false);
  });

  it("throws descriptive errors when toggling fails", () => {
    execFileSyncMock.mockImplementation(() => {
      throw new Error("Access denied");
    });

    expect(() => toggleScheduledTask("setup-bater-ponto-task.ps1", false)).toThrow(
      'Failed to disable scheduled task from "setup-bater-ponto-task.ps1". Access denied'
    );
  });

  it("re-registers the OS task when saving an enabled task", async () => {
    mockExecFileSuccess("BaterPonto\r\n");

    const fileName = await saveScheduledTask({
      ...BASE_TASK_INPUT,
      originalFileName: "setup-bater-ponto-task.ps1",
      triggerTimes: ["09:00"],
    });

    expect(fileName).toBe("setup-bater-ponto-task.ps1");
    expect(writeFileSyncMock).toHaveBeenCalledTimes(1);
    expect(execFileSyncMock).toHaveBeenCalledTimes(1);
    expect(execFileSyncMock).toHaveBeenCalledWith(
      "powershell",
      buildScheduledTaskCommandArgs("C:\\repo\\scheduled-tasks\\setup-bater-ponto-task.ps1", true),
      expect.objectContaining({ encoding: "utf8", stdio: "pipe" }),
    );
  });

  it("writes the script only when the OS task is not registered", async () => {
    mockExecFileSuccess("SomeOtherTask\r\n");

    const fileName = await saveScheduledTask({
      ...BASE_TASK_INPUT,
      originalFileName: "setup-bater-ponto-task.ps1",
    });

    expect(fileName).toBe("setup-bater-ponto-task.ps1");
    expect(writeFileSyncMock).toHaveBeenCalledTimes(1);
    expect(execFileSyncMock).not.toHaveBeenCalled();
  });

  it("removes the old OS task and registers the renamed task when it was enabled", async () => {
    mockExecFileSuccess("OldAction\r\n");
    readFileSyncMock.mockReturnValue("$TaskName = \"OldAction\"");
    parseScheduledTaskContentMock.mockReturnValue({
      fileName: "setup-old-action-task.ps1",
      actionName: "OldAction",
      triggerTimes: ["08:00"],
      weekdays: ["Monday"],
      command: "old-command",
      isEnabled: false,
    });

    const fileName = await saveScheduledTask({
      ...BASE_TASK_INPUT,
      actionName: "NewAction",
      originalFileName: "setup-old-action-task.ps1",
    });

    expect(fileName).toBe("setup-new-action-task.ps1");
    expect(execFileSyncMock).toHaveBeenCalledTimes(2);
    expect(execFileSyncMock).toHaveBeenNthCalledWith(
      1,
      "powershell",
      buildScheduledTaskCommandArgs("C:\\repo\\scheduled-tasks\\setup-old-action-task.ps1", false),
      expect.objectContaining({ encoding: "utf8", stdio: "pipe" }),
    );
    expect(execFileSyncMock).toHaveBeenNthCalledWith(
      2,
      "powershell",
      buildScheduledTaskCommandArgs("C:\\repo\\scheduled-tasks\\setup-new-action-task.ps1", true),
      expect.objectContaining({ encoding: "utf8", stdio: "pipe" }),
    );
    expect(unlinkSyncMock).toHaveBeenCalledWith("C:\\repo\\scheduled-tasks\\setup-old-action-task.ps1");
  });

  it("throws a descriptive error when OS sync fails after saving the script", async () => {
    mockExecFileSuccess("BaterPonto\r\n");
    execFileSyncMock.mockImplementation(() => {
      throw new Error("Access denied");
    });

    await expect(
      saveScheduledTask({
        ...BASE_TASK_INPUT,
        originalFileName: "setup-bater-ponto-task.ps1",
      }),
    ).rejects.toThrow(
      "Saved script but failed to update Windows scheduled task. Failed to enable scheduled task",
    );
  });
});
