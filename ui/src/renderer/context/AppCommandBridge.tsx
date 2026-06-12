import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

interface AppCommandBridgeValue {
  registerCustomActionCreate: (handler: () => void) => () => void;
  registerScheduledTaskCreate: (handler: () => void) => () => void;
  requestCustomActionCreate: () => void;
  requestScheduledTaskCreate: () => void;
}

const AppCommandBridgeContext = createContext<AppCommandBridgeValue | null>(null);

export function AppCommandBridgeProvider({ children }: { children: ReactNode }): JSX.Element {
  const customActionCreateHandlerRef = useRef<(() => void) | null>(null);
  const scheduledTaskCreateHandlerRef = useRef<(() => void) | null>(null);

  const registerCustomActionCreate = useCallback((handler: () => void): (() => void) => {
    customActionCreateHandlerRef.current = handler;
    return () => {
      if (customActionCreateHandlerRef.current === handler) {
        customActionCreateHandlerRef.current = null;
      }
    };
  }, []);

  const registerScheduledTaskCreate = useCallback((handler: () => void): (() => void) => {
    scheduledTaskCreateHandlerRef.current = handler;
    return () => {
      if (scheduledTaskCreateHandlerRef.current === handler) {
        scheduledTaskCreateHandlerRef.current = null;
      }
    };
  }, []);

  const requestCustomActionCreate = useCallback((): void => {
    customActionCreateHandlerRef.current?.();
  }, []);

  const requestScheduledTaskCreate = useCallback((): void => {
    scheduledTaskCreateHandlerRef.current?.();
  }, []);

  useEffect(() => {
    const appApi = window.api;
    if (!appApi?.app) {
      return;
    }

    const unsubscribeCustomAction = appApi.app.onNewCustomAction(requestCustomActionCreate);
    const unsubscribeScheduledTask = appApi.app.onNewScheduledTask(requestScheduledTaskCreate);

    return () => {
      unsubscribeCustomAction();
      unsubscribeScheduledTask();
    };
  }, [requestCustomActionCreate, requestScheduledTaskCreate]);

  const value = useMemo<AppCommandBridgeValue>(
    () => ({
      registerCustomActionCreate,
      registerScheduledTaskCreate,
      requestCustomActionCreate,
      requestScheduledTaskCreate,
    }),
    [
      registerCustomActionCreate,
      registerScheduledTaskCreate,
      requestCustomActionCreate,
      requestScheduledTaskCreate,
    ],
  );

  return (
    <AppCommandBridgeContext.Provider value={value}>{children}</AppCommandBridgeContext.Provider>
  );
}

export function useAppCommandBridge(): AppCommandBridgeValue {
  const context = useContext(AppCommandBridgeContext);
  if (!context) {
    throw new Error("useAppCommandBridge must be used within AppCommandBridgeProvider");
  }
  return context;
}
