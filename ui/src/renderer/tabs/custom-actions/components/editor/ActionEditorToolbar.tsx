import type { EditorMode } from "../../types";
import type {
  DraftFieldValidationKey,
  FlowValidationSeverity,
} from "../../utils/flowValidationUtils";
import { ActionNameEditor } from "./ActionNameEditor";
import { BrowserProfileCombobox } from "./BrowserProfileCombobox";

interface ActionEditorToolbarProps {
  actionName: string;
  browserProfile: string;
  draftFieldValidationState: Partial<Record<DraftFieldValidationKey, FlowValidationSeverity>>;
  editorMode: Exclude<EditorMode, null>;
  hasBrowserSteps: boolean;
  updateActionName: (nextActionName: string) => void;
  updateBrowserProfile: (nextProfile: string) => void;
}

export function ActionEditorToolbar({
  actionName,
  browserProfile,
  draftFieldValidationState,
  editorMode,
  hasBrowserSteps,
  updateActionName,
  updateBrowserProfile,
}: ActionEditorToolbarProps): JSX.Element {
  return (
    <div className="action-editor-toolbar">
      <ActionNameEditor
        editorMode={editorMode}
        validationSeverity={draftFieldValidationState.actionName}
        value={actionName}
        updateActionName={updateActionName}
      />
      {hasBrowserSteps ? (
        <BrowserProfileCombobox
          validationSeverity={draftFieldValidationState.browserProfile}
          value={browserProfile}
          updateBrowserProfile={updateBrowserProfile}
        />
      ) : null}
    </div>
  );
}
