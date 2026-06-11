import { ModalCloseButton } from "../../../components/ModalCloseButton";
import { useModalDismiss } from "../../../hooks/useModalDismiss";

interface DeleteActionModalProps {
  actionName: string;
  closeDeleteModal: () => void;
  confirmDelete: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteActionModal({
  actionName,
  closeDeleteModal,
  confirmDelete,
  isDeleting,
}: DeleteActionModalProps): JSX.Element {
  const { backdropProps, panelProps } = useModalDismiss(closeDeleteModal);

  return (
    <div className="modal-backdrop" {...backdropProps}>
      <div className="modal" style={{ width: "min(520px, 95vw)" }} {...panelProps}>
        <header className="modal-header">
          <h3>Delete action {actionName}?</h3>
          <ModalCloseButton onClick={closeDeleteModal} />
        </header>
        <div className="modal-body">
          <p className="status-text">
            This permanently removes the action from your config. This cannot be undone.
          </p>

          <div className="modal-actions">
            <button
              type="button"
              className="button button-red"
              onClick={closeDeleteModal}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button button-red"
              onClick={() => void confirmDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
