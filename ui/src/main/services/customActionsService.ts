import { spawn } from "node:child_process";
import path from "node:path";
import type { RunCustomActionInput, RunCustomActionResult } from "../../shared/types";
import { readConfig } from "./configService";
import { getRepoPaths, resolvePredefinedCommandBatPath } from "./repoPaths";

function buildCliArgs(input: RunCustomActionInput): string[] {
  const actionArgs = Object.entries(input.args)
    .filter((entry) => entry[1].trim().length > 0)
    .map(([argName, argValue]) => `--arg.${argName}=${argValue}`);

  return [`--action=${input.actionName}`, ...actionArgs];
}

export async function runCustomAction(input: RunCustomActionInput): Promise<RunCustomActionResult> {
  const actionName = input.actionName.trim();
  if (!actionName) {
    throw new Error("Action name cannot be empty.");
  }

  const appConfig = readConfig();
  if (!appConfig.actionRunner[actionName]) {
    throw new Error(`Action "${actionName}" does not exist in config.`);
  }

  const { userDataRoot } = getRepoPaths();
  const actionRunnerBatPath = resolvePredefinedCommandBatPath("action-runner");
  const actionRunnerWorkingDirectory = path.dirname(actionRunnerBatPath);
  const args = buildCliArgs({
    actionName,
    args: input.args,
  });

  const executionResult = await new Promise<RunCustomActionResult>((resolve, reject) => {
    const childProcess = spawn(actionRunnerBatPath, args, {
      cwd: actionRunnerWorkingDirectory,
      shell: true,
      windowsHide: true,
      env: {
        ...process.env,
        SHELLFORGE_USER_DATA: userDataRoot,
      },
    });

    let stdoutContent = "";
    let stderrContent = "";

    childProcess.stdout.on("data", (chunk: Buffer | string) => {
      stdoutContent += chunk.toString();
    });
    childProcess.stderr.on("data", (chunk: Buffer | string) => {
      stderrContent += chunk.toString();
    });

    childProcess.on("error", (error) => {
      reject(error);
    });

    childProcess.on("close", (exitCode) => {
      const result = {
        stdout: stdoutContent.trim(),
        stderr: stderrContent.trim(),
      };
      if (exitCode === 0) {
        resolve(result);
        return;
      }
      reject(
        new Error(
          `Action runner failed with exit code ${String(exitCode)}.\n${result.stderr || result.stdout}`
        )
      );
    });
  });

  return executionResult;
}
