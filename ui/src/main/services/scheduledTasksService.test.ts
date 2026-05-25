import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listScheduledTaskRecords } from "./ps1Parser";
import { getRepoPaths } from "./repoPaths";
import {
  buildScheduledTaskCommandArgs,
  listScheduledTasks,
  toggleScheduledTask,
} from "./scheduledTasksService";

vi.mock("node:child_process", () => ({
  execFileSync: vi.fn(),
}));

vi.mock("node:fs", () => ({
  default: {
    existsSync: vi.fn(),
    writeFileSync: vi.fn(),
    unlinkSync: vi.fn(),
  },
}));

vi.mock("./ps1Parser", () => ({
  listScheduledTaskRecords: vi.fn(),
}));

vi.mock("./repoPaths", () => ({
  getRepoPaths: vi.fn(),
}));

describe("scheduledTasksService", () => {
  const execFileSyncMock = vi.mocked(execFileSync);
  const existsSyncMock = vi.mocked(fs.existsSync);
  const listScheduledTaskRecordsMock = vi.mocked(listScheduledTaskRecords);
  const getRepoPathsMock = vi.mocked(getRepoPaths);

  beforeEach(() => {
    vi.clearAllMocks();
    getRepoPathsMock.mockReturnValue({
      repoRoot: "C:\\repo",
      configPath: "C:\\repo\\config\\config.json",
      scheduledTasksDir: "C:\\repo\\scheduled-tasks",
      touchBatPath: "C:\\repo\\touch\\touch.bat",
      reinitializeBatPath: "C:\\repo\\reinitialize\\reinitialize.bat",
      actionRunnerBatPath: "C:\\repo\\action-runner\\action-runner.bat",
    });
  });

  // Scenario: toggling command args must append -Remove when disabling.
  // Expected: argument list changes by mode while preserving script execution flags.
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

  // Scenario: list operation must map persisted task scripts to OS registration state.
  // Expected: isEnabled is true only when task name exists in Get-ScheduledTask output.
  it("merges parsed task files with current OS scheduled task state", () => {
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
    execFileSyncMock.mockReturnValue("BaterPonto\r\nSomeOtherTask\r\n");

    const records = listScheduledTasks();

    expect(records).toHaveLength(2);
    expect(records[0].isEnabled).toBe(true);
    expect(records[1].isEnabled).toBe(false);
  });

  // Scenario: script execution fails while disabling a task.
  // Expected: service throws a user-focused error that explains the failed operation.
  it("throws descriptive errors when toggling fails", () => {
    existsSyncMock.mockReturnValue(true);
    execFileSyncMock.mockImplementation(() => {
      throw new Error("Access denied");
    });

    expect(() => toggleScheduledTask("setup-bater-ponto-task.ps1", false)).toThrow(
      'Failed to disable scheduled task from "setup-bater-ponto-task.ps1". Access denied'
    );
  });
});
