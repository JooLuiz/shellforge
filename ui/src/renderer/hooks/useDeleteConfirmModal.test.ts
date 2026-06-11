/**
 * @vitest-environment happy-dom
 */
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDeleteConfirmModal } from "./useDeleteConfirmModal";

describe("useDeleteConfirmModal", () => {
  it("opens and closes the pending delete state", () => {
    const deleteItem = vi.fn(async () => true);
    const { result } = renderHook(() => useDeleteConfirmModal({ deleteItem }));

    act(() => {
      result.current.openDeleteModal("action-a", "Action A");
    });

    expect(result.current.pendingDelete).toEqual({ id: "action-a", label: "Action A" });
    expect(result.current.isDeleting).toBe(false);

    act(() => {
      result.current.closeDeleteModal();
    });

    expect(result.current.pendingDelete).toBeNull();
    expect(result.current.isDeleting).toBe(false);
  });

  it("closes the modal after a successful delete", async () => {
    const deleteItem = vi.fn(async () => true);
    const { result } = renderHook(() => useDeleteConfirmModal({ deleteItem }));

    act(() => {
      result.current.openDeleteModal("action-a", "Action A");
    });

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(deleteItem).toHaveBeenCalledWith("action-a");
    expect(result.current.pendingDelete).toBeNull();
    expect(result.current.isDeleting).toBe(false);
  });

  it("keeps the modal open when delete fails", async () => {
    const deleteItem = vi.fn(async () => false);
    const { result } = renderHook(() => useDeleteConfirmModal({ deleteItem }));

    act(() => {
      result.current.openDeleteModal("action-a", "Action A");
    });

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(result.current.pendingDelete).toEqual({ id: "action-a", label: "Action A" });
    expect(result.current.isDeleting).toBe(false);
  });

  it("prevents double-submit while delete is in flight", async () => {
    let resolveDelete: ((value: boolean) => void) | undefined;
    const deleteItem = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolveDelete = resolve;
        }),
    );
    const { result } = renderHook(() => useDeleteConfirmModal({ deleteItem }));

    act(() => {
      result.current.openDeleteModal("action-a", "Action A");
    });

    let firstConfirm: Promise<void> | undefined;
    act(() => {
      firstConfirm = result.current.confirmDelete();
    });

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(deleteItem).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveDelete?.(true);
      await firstConfirm;
    });

    expect(result.current.pendingDelete).toBeNull();
  });
});
