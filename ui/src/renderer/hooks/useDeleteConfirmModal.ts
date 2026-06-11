import { useCallback, useState } from "react";

interface PendingDeleteItem {
  id: string;
  label: string;
}

interface UseDeleteConfirmModalInput {
  deleteItem: (id: string) => Promise<boolean>;
}

interface UseDeleteConfirmModalResult {
  closeDeleteModal: () => void;
  confirmDelete: () => Promise<void>;
  isDeleting: boolean;
  openDeleteModal: (id: string, label?: string) => void;
  pendingDelete: PendingDeleteItem | null;
}

export function useDeleteConfirmModal({
  deleteItem,
}: UseDeleteConfirmModalInput): UseDeleteConfirmModalResult {
  const [pendingDelete, setPendingDelete] = useState<PendingDeleteItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = useCallback((id: string, label?: string): void => {
    setPendingDelete({ id, label: label ?? id });
    setIsDeleting(false);
  }, []);

  const closeDeleteModal = useCallback((): void => {
    setPendingDelete(null);
    setIsDeleting(false);
  }, []);

  const confirmDelete = useCallback(async (): Promise<void> => {
    if (!pendingDelete || isDeleting) {
      return;
    }

    setIsDeleting(true);
    const didDelete = await deleteItem(pendingDelete.id);
    setIsDeleting(false);

    if (didDelete) {
      closeDeleteModal();
    }
  }, [closeDeleteModal, deleteItem, isDeleting, pendingDelete]);

  return {
    pendingDelete,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  };
}
