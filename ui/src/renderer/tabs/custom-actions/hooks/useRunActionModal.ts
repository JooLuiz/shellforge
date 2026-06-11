import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ActionConfig } from "../../../../shared/types";
import { collectRequiredArgs } from "../utils/actionConfigUtils";

export type RunActionFeedbackKind = "success" | "error";

export interface RunActionFeedback {
  kind: RunActionFeedbackKind;
  message: string;
}

interface OpenRunModalInput {
  actionName: string;
  actionConfig?: ActionConfig;
}

interface UseRunActionModalResult {
  isRunningAction: boolean;
  runActionFeedback: RunActionFeedback | null;
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
  const [runActionFeedback, setRunActionFeedback] = useState<RunActionFeedback | null>(null);

  const openRunModal = ({ actionName, actionConfig }: OpenRunModalInput): void => {
    const requiredArgs = actionConfig ? collectRequiredArgs(actionConfig) : [];
    const initialArgs = requiredArgs.reduce(
      (accumulator, argName) => ({ ...accumulator, [argName]: "" }),
      {} as Record<string, string>,
    );
    setRunActionName(actionName);
    setRunArgsDraft(initialArgs);
    setRunActionFeedback(null);
  };

  const closeRunModal = (): void => {
    setRunActionName(null);
    setRunArgsDraft({});
    setRunActionFeedback(null);
    setIsRunningAction(false);
  };

  const runAction = async (): Promise<void> => {
    if (!runActionName) {
      return;
    }
    setIsRunningAction(true);
    setRunActionFeedback(null);
    try {
      const runResult = await window.api.customActions.run({
        actionName: runActionName,
        args: runArgsDraft,
      });
      setRunActionFeedback({
        kind: "success",
        message:
          runResult.stdout.length > 0
            ? `Action executed successfully.\n${runResult.stdout}`
            : "Action executed successfully.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown execution error";
      setRunActionFeedback({
        kind: "error",
        message: `Execution failed.\n${message}`,
      });
    } finally {
      setIsRunningAction(false);
    }
  };

  return {
    isRunningAction,
    runActionFeedback,
    runActionName,
    runArgsDraft,
    closeRunModal,
    openRunModal,
    runAction,
    setRunArgsDraft,
  };
}
