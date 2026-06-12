import { describe, expect, it } from "vitest";
import type { ActionConfig } from "../../../../shared/types";
import { hasActionNameConflict } from "./actionNameConflict";

const actionRunnerFixture: Record<string, ActionConfig> = {
  "lancar-horas": { steps: [] },
  "sync-calendar": { steps: [] },
};

describe("hasActionNameConflict", () => {
  it("returns true when creating an action with an existing name", () => {
    const hasConflict = hasActionNameConflict({
      actionRunner: actionRunnerFixture,
      editorMode: "create",
      editorOriginalActionName: null,
      nextActionName: "lancar-horas",
    });

    expect(hasConflict).toBe(true);
  });

  it("returns false when creating an action with a new name", () => {
    const hasConflict = hasActionNameConflict({
      actionRunner: actionRunnerFixture,
      editorMode: "create",
      editorOriginalActionName: null,
      nextActionName: "close-month",
    });

    expect(hasConflict).toBe(false);
  });

  it("returns false when editing an action without renaming it", () => {
    const hasConflict = hasActionNameConflict({
      actionRunner: actionRunnerFixture,
      editorMode: "edit",
      editorOriginalActionName: "lancar-horas",
      nextActionName: "lancar-horas",
    });

    expect(hasConflict).toBe(false);
  });

  it("returns true when renaming an action to an existing different name", () => {
    const hasConflict = hasActionNameConflict({
      actionRunner: actionRunnerFixture,
      editorMode: "edit",
      editorOriginalActionName: "lancar-horas",
      nextActionName: "sync-calendar",
    });

    expect(hasConflict).toBe(true);
  });

  it("returns false when renaming an action to a new name", () => {
    const hasConflict = hasActionNameConflict({
      actionRunner: actionRunnerFixture,
      editorMode: "edit",
      editorOriginalActionName: "lancar-horas",
      nextActionName: "create-report",
    });

    expect(hasConflict).toBe(false);
  });
});
