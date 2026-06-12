import PrettyIcons from "js-pretty-icons";
import { useEffect, useRef, useState } from "react";
import type { EditorMode } from "../../types";
import type { FlowValidationSeverity } from "../../utils/flowValidationUtils";
import { getFieldBlockClassName } from "../../utils/flowValidationUtils";

interface ActionNameEditorProps {
  editorMode: Exclude<EditorMode, null>;
  validationSeverity?: FlowValidationSeverity;
  value: string;
  updateActionName: (nextActionName: string) => void;
}

export function ActionNameEditor({
  editorMode,
  validationSeverity,
  value,
  updateActionName,
}: ActionNameEditorProps): JSX.Element {
  const startsInInputMode = editorMode === "create";
  const [isEditingName, setIsEditingName] = useState(startsInInputMode);
  const [draftName, setDraftName] = useState(value);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isEditingName) {
      setDraftName(value);
    }
  }, [isEditingName, value]);

  useEffect(() => {
    if (!isEditingName || !inputRef.current) {
      return;
    }
    inputRef.current.focus();
    inputRef.current.select();
  }, [isEditingName]);

  const enterEditMode = (): void => {
    setDraftName(value);
    setIsEditingName(true);
  };

  const cancelEdit = (): void => {
    setDraftName(value);
    setIsEditingName(false);
  };

  const commitEdit = (): void => {
    updateActionName(draftName.trim());
    if (editorMode === "edit") {
      setIsEditingName(false);
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitEdit();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
    }
  };

  if (isEditingName) {
    return (
      <div
        className={getFieldBlockClassName(
          "action-name-editor",
          validationSeverity,
        )}
      >
        <span className="action-name-editor-prefix">Action:</span>
        <input
          ref={inputRef}
          className="action-name-editor-input"
          value={draftName}
          placeholder="Action Name"
          onChange={(event) => setDraftName(event.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleInputKeyDown}
          aria-label="Action name"
        />
      </div>
    );
  }

  return (
    <div
      className={getFieldBlockClassName("action-name-editor", validationSeverity)}
    >
      <span className="action-name-editor-prefix">Action:</span>
      <button
        type="button"
        className="action-name-editor-display"
        onClick={enterEditMode}
        aria-label="Edit action name"
      >
        <span className="action-name-editor-label">{value}</span>
        <PrettyIcons icon="pencil" width={18} height={18} color="currentColor" />
      </button>
    </div>
  );
}
