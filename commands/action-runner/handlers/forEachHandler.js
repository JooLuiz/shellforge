"use strict";

/**
 * Role: Iterates over a list or repeats N times, running sub-steps each iteration.
 * Not in this file: DOM-driven iteration (see forEachElement in stepHandlers.js).
 * Key dependencies: resources.runSteps for executing child step arrays.
 * See also: action-runner/runSteps.js, action-runner/normalizeSteps.js
 */

const ITEM_CONTEXT_KEY = "item";
const INDEX_CONTEXT_KEY = "index";

function restoreContextKey(runtimeContext, key, hadPrevious, previousValue) {
  if (hadPrevious) {
    runtimeContext[key] = previousValue;
    return;
  }

  delete runtimeContext[key];
}

async function handleForEach(resources, step, logInfo, runtimeContext) {
  const hadPreviousItem = ITEM_CONTEXT_KEY in runtimeContext;
  const hadPreviousIndex = INDEX_CONTEXT_KEY in runtimeContext;
  const previousItem = runtimeContext[ITEM_CONTEXT_KEY];
  const previousIndex = runtimeContext[INDEX_CONTEXT_KEY];

  const hasList = step.list !== undefined;
  if (hasList && !Array.isArray(step.list)) {
    throw new Error('[Action Runner] forEach "list" must resolve to an array');
  }

  const isListMode = hasList;
  const totalIterations = isListMode ? step.list.length : step.count;

  logInfo(
    isListMode
      ? `forEach starting over list of ${totalIterations} item(s)`
      : `forEach starting with count of ${totalIterations}`
  );

  try {
    for (let iterationIndex = 0; iterationIndex < totalIterations; iterationIndex++) {
      runtimeContext[INDEX_CONTEXT_KEY] = iterationIndex;

      if (isListMode) {
        runtimeContext[ITEM_CONTEXT_KEY] = step.list[iterationIndex];
      }

      logInfo(`forEach iteration ${iterationIndex + 1}/${totalIterations}`);

      await resources.runSteps(
        resources,
        step.steps,
        (message) => logInfo(`forEach[${iterationIndex}] ${message}`),
        runtimeContext
      );
    }
  } finally {
    restoreContextKey(runtimeContext, ITEM_CONTEXT_KEY, hadPreviousItem, previousItem);
    restoreContextKey(runtimeContext, INDEX_CONTEXT_KEY, hadPreviousIndex, previousIndex);
  }

  return null;
}

module.exports = {
  handleForEach,
};
