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
 * Role: Writes a resolved value into the shared runtime context.
 * Not in this file: Resolving dynamic placeholders from source strings.
 * Key dependencies: Action runner context object.
 * See also: action-runner/interpolateContext.js, action-runner/runSteps.js
 */

async function handleSetVariable(_resources, step, logInfo, runtimeContext) {
  runtimeContext[step.storeAs] = step.source;
  logInfo(`Stored value in context.${step.storeAs}`);
  return null;
}

module.exports = {
  handleSetVariable,
};
