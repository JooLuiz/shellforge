import type { Dispatch, SetStateAction } from "react";
import { ModalCloseButton } from "../../../components/ModalCloseButton";
import { useModalDismiss } from "../../../hooks/useModalDismiss";
import type { RunActionFeedback } from "../hooks/useRunActionModal";

interface RunActionModalProps {
  closeRunModal: () => void;
  isRunningAction: boolean;
  runAction: () => Promise<void>;
  runActionFeedback: RunActionFeedback | null;
  runActionName: string;
  runArgsDraft: Record<string, string>;
  setRunArgsDraft: Dispatch<SetStateAction<Record<string, string>>>;
}

export function RunActionModal({
  closeRunModal,
  isRunningAction,
  runAction,
  runActionFeedback,
  runActionName,
  runArgsDraft,
  setRunArgsDraft,
}: RunActionModalProps): JSX.Element {
  const { backdropProps, panelProps } = useModalDismiss(closeRunModal);

  return (
    <div className="modal-backdrop" {...backdropProps}>
      <div className="modal" style={{ width: "min(760px, 95vw)" }} {...panelProps}>
        <header className="modal-header">
          <h3>Executing action {runActionName}</h3>
          <ModalCloseButton onClick={closeRunModal} />
        </header>
        <div className="modal-body">
          {Object.keys(runArgsDraft).length > 0 ? (
            Object.keys(runArgsDraft).map((argName) => (
              <label key={argName} className="field-block">
                {`{{${argName}}}`}
                <input
                  value={runArgsDraft[argName]}
                  onChange={(event) =>
                    setRunArgsDraft((previousRunArgsDraft) => ({
                      ...previousRunArgsDraft,
                      [argName]: event.target.value,
                    }))
                  }
                />
              </label>
            ))
          ) : (
            <p className="status-text">This action does not require arguments.</p>
          )}

          {runActionFeedback ? (
            <div
              className={
                runActionFeedback.kind === "success" ? "success-banner" : "error-banner"
              }
            >
              {runActionFeedback.message}
            </div>
          ) : null}

          <div className="modal-actions">
            <button
              type="button"
              className="button button-red"
              onClick={closeRunModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button button-green"
              onClick={() => void runAction()}
              disabled={isRunningAction}
            >
              {isRunningAction ? "Running..." : "Run Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
