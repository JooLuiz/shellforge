import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AppConfig } from "../../../../shared/types";
import type { RowMetadataPatch } from "../types";

interface UseActionRowsInput {
  config: AppConfig;
  onSave: (nextConfig: AppConfig) => Promise<void>;
}

interface UseActionRowsResult {
  actionNames: string[];
  aliasDraftByActionName: Record<string, string>;
  rowPendingByActionName: Record<string, boolean>;
  rowSaveErrorMessage: string | null;
  deleteAction: (actionName: string) => Promise<boolean>;
  saveRowMetadata: (
    actionName: string,
    metadataPatch: RowMetadataPatch,
  ) => Promise<boolean>;
  setAliasDraftByActionName: Dispatch<SetStateAction<Record<string, string>>>;
}

export function useActionRows({
  config,
  onSave,
}: UseActionRowsInput): UseActionRowsResult {
  const actionNames = useMemo(
    () => Object.keys(config.actionRunner).sort(),
    [config.actionRunner],
  );
  const [aliasDraftByActionName, setAliasDraftByActionName] = useState<
    Record<string, string>
  >({});
  const [rowPendingByActionName, setRowPendingByActionName] = useState<
    Record<string, boolean>
  >({});
  const [rowSaveErrorMessage, setRowSaveErrorMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const nextAliasDraftByActionName = actionNames.reduce(
      (accumulator, actionName) => ({
        ...accumulator,
        [actionName]:
          config.ui.customActions[actionName]?.aliases[0] ?? actionName,
      }),
      {} as Record<string, string>,
    );
    setAliasDraftByActionName(nextAliasDraftByActionName);
  }, [actionNames, config.ui.customActions]);

  useEffect(() => {
    setRowPendingByActionName((previousPendingByActionName) => {
      const nextPendingByActionName: Record<string, boolean> = {};
      actionNames.forEach((actionName) => {
        if (previousPendingByActionName[actionName]) {
          nextPendingByActionName[actionName] = true;
        }
      });
      return nextPendingByActionName;
    });
  }, [actionNames]);

  const setRowPendingState = (actionName: string, isPending: boolean): void => {
    setRowPendingByActionName((previousPendingByActionName) => {
      const wasPending = previousPendingByActionName[actionName] ?? false;
      if (wasPending === isPending) {
        return previousPendingByActionName;
      }

      if (isPending) {
        return {
          ...previousPendingByActionName,
          [actionName]: true,
        };
      }

      const nextPendingByActionName = { ...previousPendingByActionName };
      delete nextPendingByActionName[actionName];
      return nextPendingByActionName;
    });
  };

  const saveRowMetadata = async (
    actionName: string,
    metadataPatch: RowMetadataPatch,
  ): Promise<boolean> => {
    if (rowPendingByActionName[actionName]) {
      return false;
    }

    setRowSaveErrorMessage(null);
    const currentCustomActionUi = config.ui.customActions[actionName];
    if (!currentCustomActionUi) {
      return false;
    }

    setRowPendingState(actionName, true);
    const nextPrimaryAliasCandidate = metadataPatch.primaryAlias?.trim();
    const nextPrimaryAlias =
      metadataPatch.primaryAlias !== undefined
        ? nextPrimaryAliasCandidate && nextPrimaryAliasCandidate.length > 0
          ? nextPrimaryAliasCandidate
          : actionName
        : undefined;
    const nextAliases =
      nextPrimaryAlias && nextPrimaryAlias.length > 0
        ? [
            nextPrimaryAlias,
            ...currentCustomActionUi.aliases.filter(
              (alias) => alias !== nextPrimaryAlias,
            ),
          ]
        : currentCustomActionUi.aliases;
    const nextConfig: AppConfig = {
      ...config,
      ui: {
        ...config.ui,
        customActions: {
          ...config.ui.customActions,
          [actionName]: {
            availableOnCLI:
              metadataPatch.availableOnCLI ?? currentCustomActionUi.availableOnCLI,
            aliases: nextAliases,
          },
        },
      },
    };

    try {
      await onSave(nextConfig);
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown save error";
      setRowSaveErrorMessage(message);
      return false;
    } finally {
      setRowPendingState(actionName, false);
    }
  };

  const deleteAction = async (actionName: string): Promise<boolean> => {
    if (rowPendingByActionName[actionName]) {
      return false;
    }

    const confirmed = window.confirm(`Delete action "${actionName}"?`);
    if (!confirmed) {
      return false;
    }

    setRowSaveErrorMessage(null);
    setRowPendingState(actionName, true);
    const nextActionRunner = { ...config.actionRunner };
    const nextCustomActions = { ...config.ui.customActions };
    delete nextActionRunner[actionName];
    delete nextCustomActions[actionName];

    try {
      await onSave({
        ...config,
        actionRunner: nextActionRunner,
        ui: {
          ...config.ui,
          customActions: nextCustomActions,
        },
      });
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown save error";
      setRowSaveErrorMessage(message);
      return false;
    } finally {
      setRowPendingState(actionName, false);
    }
  };

  return {
    actionNames,
    aliasDraftByActionName,
    rowPendingByActionName,
    rowSaveErrorMessage,
    deleteAction,
    saveRowMetadata,
    setAliasDraftByActionName,
  };
}
