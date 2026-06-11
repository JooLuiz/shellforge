import { formatMessage } from "../../shared/i18n";
import type { DeleteConfirmVariant } from "../../shared/i18n/types";
import { useTranslation } from "../i18n";
import { useModalDismiss } from "../hooks/useModalDismiss";
import { ModalCloseButton } from "./ModalCloseButton";

interface DeleteConfirmModalProps {
  closeDeleteModal: () => void;
  confirmDelete: () => Promise<void>;
  errorMessage?: string | null;
  isDeleting: boolean;
  itemName: string;
  variant: DeleteConfirmVariant;
}

export function DeleteConfirmModal({
  closeDeleteModal,
  confirmDelete,
  errorMessage,
  isDeleting,
  itemName,
  variant,
}: DeleteConfirmModalProps): JSX.Element {
  const { t } = useTranslation();
  const { backdropProps, panelProps } = useModalDismiss(closeDeleteModal);
  const copy = t.deleteConfirm[variant];

  return (
    <div className="modal-backdrop" {...backdropProps}>
      <div className="modal" style={{ width: "min(520px, 95vw)" }} {...panelProps}>
        <header className="modal-header">
          <h3>{formatMessage(copy.title, { itemName })}</h3>
          <ModalCloseButton onClick={closeDeleteModal} />
        </header>
        <div className="modal-body">
          <p className="status-text">{copy.description}</p>

          {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

          <div className="modal-actions">
            <button
              type="button"
              className="button button-ghost"
              onClick={closeDeleteModal}
              disabled={isDeleting}
            >
              {t.deleteConfirm.cancel}
            </button>
            <button
              type="button"
              className="button button-red"
              onClick={() => void confirmDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? t.deleteConfirm.deleting : t.deleteConfirm.confirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
