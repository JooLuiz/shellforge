import { useCallback, useState } from "react";

interface UseDeleteActionModalInput {
  deleteAction: (actionName: string) => Promise<boolean>;
}

interface UseDeleteActionModalResult {
  closeDeleteModal: () => void;
  confirmDelete: () => Promise<void>;
  deleteActionName: string | null;
  isDeleting: boolean;
  openDeleteModal: (actionName: string) => void;
}

export function useDeleteActionModal({
  deleteAction,
}: UseDeleteActionModalInput): UseDeleteActionModalResult {
  const [deleteActionName, setDeleteActionName] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = useCallback((actionName: string): void => {
    setDeleteActionName(actionName);
    setIsDeleting(false);
  }, []);

  const closeDeleteModal = useCallback((): void => {
    setDeleteActionName(null);
    setIsDeleting(false);
  }, []);

  const confirmDelete = useCallback(async (): Promise<void> => {
    if (!deleteActionName || isDeleting) {
      return;
    }

    setIsDeleting(true);
    const didDelete = await deleteAction(deleteActionName);
    setIsDeleting(false);

    if (didDelete) {
      closeDeleteModal();
    }
  }, [closeDeleteModal, deleteAction, deleteActionName, isDeleting]);

  return {
    deleteActionName,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  };
}
