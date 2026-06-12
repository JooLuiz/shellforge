import { useCallback, useState } from "react";
import { mapScheduledTaskToggleErrorMessage } from "../utils/scheduledTaskToggleErrors";

interface UseScheduledTaskActionsInput {
  refreshScheduledTasks: () => Promise<void>;
  setErrorMessage: (message: string | null) => void;
  toggleErrorMessages: {
    adminRequiredErrorMessage: string;
    invalidActionNameMessage: string;
    toggleFailedMessage: string;
    toggleRegistrationFailedMessage: string;
  };
}

interface UseScheduledTaskActionsResult {
  deleteScheduledTask: (fileName: string) => Promise<boolean>;
  togglingTaskNames: string[];
  resetErrorMessage: () => void;
  toggleTask: (fileName: string, isEnabled: boolean) => Promise<void>;
}

export function useScheduledTaskActions({
  refreshScheduledTasks,
  setErrorMessage,
  toggleErrorMessages,
}: UseScheduledTaskActionsInput): UseScheduledTaskActionsResult {
  const [togglingTaskNames, setTogglingTaskNames] = useState<string[]>([]);

  const resetErrorMessage = useCallback((): void => {
    setErrorMessage(null);
  }, [setErrorMessage]);

  const deleteScheduledTask = useCallback(
    async (fileName: string): Promise<boolean> => {
      setErrorMessage(null);
      try {
        await window.api.scheduledTasks.delete(fileName);
        await refreshScheduledTasks();
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown delete error";
        setErrorMessage(message);
        return false;
      }
    },
    [refreshScheduledTasks, setErrorMessage]
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
        setErrorMessage(mapScheduledTaskToggleErrorMessage(message, toggleErrorMessages));
      } finally {
        setTogglingTaskNames((previousTaskNames) =>
          previousTaskNames.filter((taskName) => taskName !== fileName)
        );
      }
    },
    [refreshScheduledTasks, setErrorMessage, toggleErrorMessages],
  );

  return {
    deleteScheduledTask,
    togglingTaskNames,
    resetErrorMessage,
    toggleTask,
  };
}
