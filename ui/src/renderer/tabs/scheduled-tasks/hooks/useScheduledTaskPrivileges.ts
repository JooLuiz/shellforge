import { useEffect, useState } from "react";

interface UseScheduledTaskPrivilegesResult {
  isAdministrator: boolean;
  isLoading: boolean;
  loadError: string | null;
}

export function useScheduledTaskPrivileges(): UseScheduledTaskPrivilegesResult {
  const [isAdministrator, setIsAdministrator] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    void (async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const privilegesStatus = await window.api.scheduledTasks.getPrivileges();
        if (!isCancelled) {
          setIsAdministrator(privilegesStatus.isAdministrator);
        }
      } catch (error) {
        if (!isCancelled) {
          const message =
            error instanceof Error ? error.message : "Unknown privileges check error";
          setLoadError(message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, []);

  return {
    isAdministrator,
    isLoading,
    loadError,
  };
}
