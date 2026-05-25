import type { Dispatch, SetStateAction } from "react";

interface RunActionModalProps {
  closeRunModal: () => void;
  isRunningAction: boolean;
  runAction: () => Promise<void>;
  runActionMessage: string | null;
  runActionName: string;
  runArgsDraft: Record<string, string>;
  setRunArgsDraft: Dispatch<SetStateAction<Record<string, string>>>;
}

export function RunActionModal({
  closeRunModal,
  isRunningAction,
  runAction,
  runActionMessage,
  runActionName,
  runArgsDraft,
  setRunArgsDraft,
}: RunActionModalProps): JSX.Element {
  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ width: "min(760px, 95vw)" }}>
        <header className="modal-header">
          <h3>Executing action {runActionName}</h3>
          <button
            type="button"
            className="modal-close"
            onClick={closeRunModal}
            aria-label="Close modal"
          >
            X
          </button>
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

          {runActionMessage ? (
            <div className="error-banner">{runActionMessage}</div>
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
