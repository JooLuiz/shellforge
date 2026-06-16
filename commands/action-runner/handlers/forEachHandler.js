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
