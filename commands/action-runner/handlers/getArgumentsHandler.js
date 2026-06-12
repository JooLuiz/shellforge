"use strict";

/**
 * Role: Validates and maps CLI or invokeAction arguments into runtime context.
 * Not in this file: CLI argument parsing (handled by action-runner.js).
 * Key dependencies: runtimeContext.inputArgs populated upstream.
 * See also: action-runner/action-runner.js, action-runner/handlers/invokeActionHandler.js
 */

async function handleGetArguments(_resources, step, logInfo, runtimeContext) {
  const inputArgs = runtimeContext.inputArgs ?? {};
  const requiredArgNames = step.required ?? [];
  const defaultValues = step.defaults ?? {};

  const missingArgNames = requiredArgNames.filter((argName) => {
    const argValue = inputArgs[argName];
    return argValue === undefined || argValue === null || argValue === "";
  });

  if (missingArgNames.length > 0) {
    throw new Error(
      `[Action Runner] getArguments: missing required argument(s): ${missingArgNames.join(", ")}`
    );
  }

  for (const [defaultArgName, defaultArgValue] of Object.entries(defaultValues)) {
    if (inputArgs[defaultArgName] === undefined || inputArgs[defaultArgName] === null) {
      runtimeContext[defaultArgName] = defaultArgValue;
      logInfo(`Applied default for "${defaultArgName}": ${defaultArgValue}`);
    }
  }

  for (const argName of requiredArgNames) {
    runtimeContext[argName] = inputArgs[argName];
    logInfo(`Mapped required argument "${argName}" into context`);
  }

  const optionalArgNames = step.optional ?? [];

  for (const argName of optionalArgNames) {
    if (inputArgs[argName] !== undefined && inputArgs[argName] !== null) {
      runtimeContext[argName] = inputArgs[argName];
      logInfo(`Mapped optional argument "${argName}" into context`);
    }
  }

  return null;
}

module.exports = {
  handleGetArguments,
};
