import { useCallback, useRef, useState } from "react";

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
  const isDeletingRef = useRef(false);

  const openDeleteModal = useCallback((id: string, label?: string): void => {
    setPendingDelete({ id, label: label ?? id });
    setIsDeleting(false);
    isDeletingRef.current = false;
  }, []);

  const closeDeleteModal = useCallback((): void => {
    setPendingDelete(null);
    setIsDeleting(false);
    isDeletingRef.current = false;
  }, []);

  const confirmDelete = useCallback(async (): Promise<void> => {
    if (!pendingDelete || isDeletingRef.current) {
      return;
    }

    isDeletingRef.current = true;
    setIsDeleting(true);

    try {
      const didDelete = await deleteItem(pendingDelete.id);
      if (didDelete) {
        closeDeleteModal();
      }
    } finally {
      isDeletingRef.current = false;
      setIsDeleting(false);
    }
  }, [closeDeleteModal, deleteItem, pendingDelete]);

  return {
    pendingDelete,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  };
}
