import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ActionConfig } from "../../../../shared/types";
import { collectRequiredArgs } from "../utils/actionConfigUtils";

interface OpenRunModalInput {
  actionName: string;
  actionConfig?: ActionConfig;
}

interface UseRunActionModalResult {
  isRunningAction: boolean;
  runActionMessage: string | null;
  runActionName: string | null;
  runArgsDraft: Record<string, string>;
  closeRunModal: () => void;
  openRunModal: (input: OpenRunModalInput) => void;
  runAction: () => Promise<void>;
  setRunArgsDraft: Dispatch<SetStateAction<Record<string, string>>>;
}

export function useRunActionModal(): UseRunActionModalResult {
  const [isRunningAction, setIsRunningAction] = useState(false);
  const [runActionName, setRunActionName] = useState<string | null>(null);
  const [runArgsDraft, setRunArgsDraft] = useState<Record<string, string>>({});
  const [runActionMessage, setRunActionMessage] = useState<string | null>(null);

  const openRunModal = ({ actionName, actionConfig }: OpenRunModalInput): void => {
    const requiredArgs = actionConfig ? collectRequiredArgs(actionConfig) : [];
    const initialArgs = requiredArgs.reduce(
      (accumulator, argName) => ({ ...accumulator, [argName]: "" }),
      {} as Record<string, string>,
    );
    setRunActionName(actionName);
    setRunArgsDraft(initialArgs);
    setRunActionMessage(null);
  };

  const closeRunModal = (): void => {
    setRunActionName(null);
    setRunArgsDraft({});
    setRunActionMessage(null);
    setIsRunningAction(false);
  };

  const runAction = async (): Promise<void> => {
    if (!runActionName) {
      return;
    }
    setIsRunningAction(true);
    setRunActionMessage(null);
    try {
      const runResult = await window.api.customActions.run({
        actionName: runActionName,
        args: runArgsDraft,
      });
      setRunActionMessage(
        runResult.stdout.length > 0
          ? `Action executed successfully.\n${runResult.stdout}`
          : "Action executed successfully.",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown execution error";
      setRunActionMessage(`Execution failed.\n${message}`);
    } finally {
      setIsRunningAction(false);
    }
  };

  return {
    isRunningAction,
    runActionMessage,
    runActionName,
    runArgsDraft,
    closeRunModal,
    openRunModal,
    runAction,
    setRunArgsDraft,
  };
}
