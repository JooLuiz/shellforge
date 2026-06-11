import { ModalCloseButton } from "./ModalCloseButton";
import { useModalDismiss } from "../hooks/useModalDismiss";

interface DeleteConfirmModalProps {
  closeDeleteModal: () => void;
  confirmDelete: () => Promise<void>;
  description: string;
  entityLabel: string;
  isDeleting: boolean;
  itemName: string;
}

export function DeleteConfirmModal({
  closeDeleteModal,
  confirmDelete,
  description,
  entityLabel,
  isDeleting,
  itemName,
}: DeleteConfirmModalProps): JSX.Element {
  const { backdropProps, panelProps } = useModalDismiss(closeDeleteModal);

  return (
    <div className="modal-backdrop" {...backdropProps}>
      <div className="modal" style={{ width: "min(520px, 95vw)" }} {...panelProps}>
        <header className="modal-header">
          <h3>
            Delete {entityLabel} {itemName}?
          </h3>
          <ModalCloseButton onClick={closeDeleteModal} />
        </header>
        <div className="modal-body">
          <p className="status-text">{description}</p>

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
