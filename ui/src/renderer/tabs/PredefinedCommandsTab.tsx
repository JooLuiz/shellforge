import { useEffect, useMemo, useState } from "react";
import { PREDEFINED_COMMAND_KEYS } from "../../shared/predefinedCommandsRegistry";
import type { AppConfig, PredefinedCommandKey } from "../../shared/types";
import { PredefinedCommandRow } from "./predefined-commands/PredefinedCommandRow";
import {
  buildPredefinedCommandFilterContexts,
  filterPredefinedCommands,
  type PredefinedCommandFilterCategory,
} from "./predefined-commands/predefinedCommandFilterUtils";

interface Props {
  config: AppConfig;
  onSave: (nextConfig: AppConfig) => Promise<void>;
  searchQuery: string;
  categoryFilter: PredefinedCommandFilterCategory;
}

function createAliasDraftMap(config: AppConfig): Record<PredefinedCommandKey, string> {
  return PREDEFINED_COMMAND_KEYS.reduce(
    (accumulator, commandKey) => ({
      ...accumulator,
      [commandKey]: config.ui.predefinedCommands[commandKey].alias,
    }),
    {} as Record<PredefinedCommandKey, string>
  );
}

export function PredefinedCommandsTab({
  config,
  onSave,
  searchQuery,
  categoryFilter,
}: Props): JSX.Element {
  const [isSavingRow, setIsSavingRow] = useState<PredefinedCommandKey | null>(null);
  const [aliasDrafts, setAliasDrafts] = useState<Record<PredefinedCommandKey, string>>(
    createAliasDraftMap(config)
  );

  useEffect(() => {
    setAliasDrafts(createAliasDraftMap(config));
  }, [config]);

  const commandContexts = useMemo(
    () => buildPredefinedCommandFilterContexts(config),
    [config]
  );

  const visibleCommandContexts = useMemo(
    () => filterPredefinedCommands(commandContexts, searchQuery, categoryFilter),
    [commandContexts, searchQuery, categoryFilter]
  );

  const updateCommand = async (
    commandKey: PredefinedCommandKey,
    nextValues: { enabled?: boolean; alias?: string }
  ): Promise<void> => {
    const currentCommand = config.ui.predefinedCommands[commandKey];
    const nextAliasCandidate = (nextValues.alias ?? currentCommand.alias).trim();
    const nextAlias = nextAliasCandidate.length > 0 ? nextAliasCandidate : commandKey;

    if (
      commandKey === "action-runner" &&
      nextValues.enabled === false &&
      Object.values(config.ui.customActions).some((customAction) => customAction.availableOnCLI)
    ) {
      const confirmed = window.confirm(
        "Custom actions available on CLI depend on action-runner. Disable action-runner anyway?"
      );
      if (!confirmed) {
        return;
      }
    }

    setIsSavingRow(commandKey);
    const nextConfig: AppConfig = {
      ...config,
      ui: {
        ...config.ui,
        predefinedCommands: {
          ...config.ui.predefinedCommands,
          [commandKey]: {
            enabled: nextValues.enabled ?? currentCommand.enabled,
            alias: nextAlias,
          },
        },
      },
    };

    await onSave(nextConfig);
    setIsSavingRow(null);
  };

  return (
    <div className="dashed-section">
      {visibleCommandContexts.length === 0 ? (
        <div className="info-banner">No predefined commands match the current search or filter.</div>
      ) : null}
      {visibleCommandContexts.map((commandContext) => {
        const command = config.ui.predefinedCommands[commandContext.commandKey];
        const aliasDraft = aliasDrafts[commandContext.commandKey];

        return (
          <PredefinedCommandRow
            key={commandContext.commandKey}
            commandContext={commandContext}
            aliasDraft={aliasDraft}
            enabled={command.enabled}
            isSaving={isSavingRow === commandContext.commandKey}
            onAliasDraftChange={(commandKey, nextAliasDraft) =>
              setAliasDrafts((previousDrafts) => ({
                ...previousDrafts,
                [commandKey]: nextAliasDraft,
              }))
            }
            onAliasCommit={(commandKey, aliasDraftValue) =>
              void updateCommand(commandKey, {
                alias: aliasDraftValue.trim().length > 0 ? aliasDraftValue : commandKey,
              })
            }
            onEnabledChange={(commandKey, enabled) =>
              void updateCommand(commandKey, { enabled })
            }
          />
        );
      })}
    </div>
  );
}
