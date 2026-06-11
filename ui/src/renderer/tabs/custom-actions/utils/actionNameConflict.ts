import type { ActionConfig } from "../../../../shared/types";
import type { EditorMode } from "../types";

interface HasActionNameConflictInput {
  actionRunner: Record<string, ActionConfig>;
  editorMode: Exclude<EditorMode, null>;
  editorOriginalActionName: string | null;
  nextActionName: string;
}

export function hasActionNameConflict({
  actionRunner,
  editorMode,
  editorOriginalActionName,
  nextActionName,
}: HasActionNameConflictInput): boolean {
  const actionNameExists = Object.prototype.hasOwnProperty.call(
    actionRunner,
    nextActionName,
  );

  if (!actionNameExists) {
    return false;
  }

  if (editorMode === "create") {
    return true;
  }

  return editorOriginalActionName !== nextActionName;
}
