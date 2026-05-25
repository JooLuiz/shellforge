import { useCallback, useState } from "react";

interface UseScheduledTaskActionsInput {
  refreshScheduledTasks: () => Promise<void>;
  setErrorMessage: (message: string | null) => void;
}

interface UseScheduledTaskActionsResult {
  togglingTaskNames: string[];
  removeTask: (fileName: string) => Promise<void>;
  resetErrorMessage: () => void;
  toggleTask: (fileName: string, isEnabled: boolean) => Promise<void>;
}

export function useScheduledTaskActions({
  refreshScheduledTasks,
  setErrorMessage,
}: UseScheduledTaskActionsInput): UseScheduledTaskActionsResult {
  const [togglingTaskNames, setTogglingTaskNames] = useState<string[]>([]);

  const resetErrorMessage = useCallback((): void => {
    setErrorMessage(null);
  }, [setErrorMessage]);

  const removeTask = useCallback(
    async (fileName: string): Promise<void> => {
      const confirmed = window.confirm(`Delete scheduled task file "${fileName}"?`);
      if (!confirmed) {
        return;
      }
      await window.api.scheduledTasks.delete(fileName);
      await refreshScheduledTasks();
    },
    [refreshScheduledTasks]
  );

  const toggleTask = useCallback(
    async (fileName: string, isEnabled: boolean): Promise<void> => {
      setTogglingTaskNames((previousTaskNames) => [...previousTaskNames, fileName]);
      setErrorMessage(null);
      try {
        await window.api.scheduledTasks.toggle(fileName, isEnabled);
        await refreshScheduledTasks();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown toggle error";
        setErrorMessage(message);
      } finally {
        setTogglingTaskNames((previousTaskNames) =>
          previousTaskNames.filter((taskName) => taskName !== fileName)
        );
      }
    },
    [refreshScheduledTasks, setErrorMessage]
  );

  return {
    togglingTaskNames,
    removeTask,
    resetErrorMessage,
    toggleTask,
  };
}
