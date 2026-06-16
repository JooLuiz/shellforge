/*
 * Copyright (C) 2026 João Luiz de Castro
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 */

"use strict";

/**
 * Role: Executes shell commands from action steps and exposes output to context.
 * Not in this file: Interactive terminal orchestration for long-running sessions.
 * Key dependencies: Node.js child_process.exec and runtime context storage.
 * See also: action-runner/runSteps.js, README.md
 */

const { exec } = require("node:child_process");

function resolveCommand(step) {
  if (typeof step.command === "string" && step.command.length > 0) {
    return step.command;
  }

  if (Array.isArray(step.commands) && step.commands.length > 0) {
    return step.commands.join("; ");
  }

  throw new Error('[Action Runner] shell step requires "command" or "commands"');
}

function executeCommand(command, options) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
        return;
      }

      resolve({ stdout, stderr, exitCode: 0 });
    });
  });
}

function buildExecOptions(step, resolvedCommand) {
  const shellExecutable = step.shell ?? "powershell.exe";
  const shellArgs = step.shellArgs ?? [];
  const baseOptions = {
    cwd: step.cwd,
    timeout: step.timeout ?? 0,
    maxBuffer: step.maxBuffer ?? 10 * 1024 * 1024,
    windowsHide: true,
  };

  if (shellArgs.length === 0) {
    return {
      command: resolvedCommand,
      options: { ...baseOptions, shell: shellExecutable },
    };
  }

  const encodedCommand = Buffer.from(resolvedCommand, "utf16le").toString("base64");
  const fullInvocation = [shellExecutable, ...shellArgs, "-EncodedCommand", encodedCommand].join(" ");

  return {
    command: fullInvocation,
    options: { ...baseOptions, shell: true },
  };
}

async function handleShell(_resources, step, logInfo, runtimeContext) {
  const resolvedCommand = resolveCommand(step);
  const { command: finalCommand, options: execOptions } = buildExecOptions(step, resolvedCommand);

  logInfo(`Running shell command: ${resolvedCommand}`);

  try {
    const shellResult = await executeCommand(finalCommand, execOptions);

    const trimmedStdout = shellResult.stdout?.trim();
    const trimmedStderr = shellResult.stderr?.trim();

    if (trimmedStdout) {
      logInfo(`stdout:\n${trimmedStdout}`);
    }

    if (trimmedStderr) {
      logInfo(`stderr:\n${trimmedStderr}`);
    }

    if (typeof step.storeAs === "string" && step.storeAs.length > 0) {
      runtimeContext[step.storeAs] = shellResult;
      logInfo(`Stored shell output in context.${step.storeAs}`);
    }

    return null;
  } catch (executionError) {
    if (step.ignoreExitCode === true) {
      const trimmedErrorStdout = executionError.stdout?.trim();
      const trimmedErrorStderr = executionError.stderr?.trim();

      if (trimmedErrorStdout) {
        logInfo(`stdout:\n${trimmedErrorStdout}`);
      }

      if (trimmedErrorStderr) {
        logInfo(`stderr:\n${trimmedErrorStderr}`);
      }

      if (typeof step.storeAs === "string" && step.storeAs.length > 0) {
        runtimeContext[step.storeAs] = {
          stdout: executionError.stdout,
          stderr: executionError.stderr,
          exitCode: executionError.error?.code ?? 1,
        };
        logInfo(`Stored shell failure output in context.${step.storeAs}`);
      }

      return null;
    }

    const shellError = executionError.error;
    const errorMessage = shellError?.message ?? "Unknown shell execution error";
    throw new Error(`[Action Runner] Shell command failed: ${errorMessage}`, {
      cause: executionError,
    });
  }
}

module.exports = {
  handleShell,
};
