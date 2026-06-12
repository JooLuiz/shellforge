import { createContext, useContext, type ReactNode } from "react";
import type { ActionConfig } from "../../../../shared/types";
import type { UseActionEditorResult } from "../hooks/useActionEditor";

export interface ActionEditorContextValue {
  actionRunner: Record<string, ActionConfig>;
  configuredActionNames: string[];
  editor: UseActionEditorResult;
}

const ActionEditorContext = createContext<ActionEditorContextValue | null>(null);

interface ActionEditorProviderProps {
  actionRunner: Record<string, ActionConfig>;
  configuredActionNames: string[];
  editor: UseActionEditorResult;
  children: ReactNode;
}

export function ActionEditorProvider({
  actionRunner,
  configuredActionNames,
  editor,
  children,
}: ActionEditorProviderProps): JSX.Element {
  return (
    <ActionEditorContext.Provider value={{ actionRunner, configuredActionNames, editor }}>
      {children}
    </ActionEditorContext.Provider>
  );
}

export function useActionEditorContext(): ActionEditorContextValue {
  const context = useContext(ActionEditorContext);
  if (!context) {
    throw new Error("useActionEditorContext must be used within ActionEditorProvider");
  }
  return context;
}
