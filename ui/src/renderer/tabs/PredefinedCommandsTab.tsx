import { useEffect, useState } from "react";
import type { AppConfig, PredefinedCommandKey } from "../../shared/types";

interface Props {
  config: AppConfig;
  onSave: (nextConfig: AppConfig) => Promise<void>;
}

const COMMAND_DESCRIPTION: Record<PredefinedCommandKey, string> = {
  touch: "This command allows the creation of a new file from the CLI.",
  reinitialize: "This command allows to restart the shell in the same terminal instance.",
  "action-runner":
    "This command allows to create custom action commands in the custom actions tab.",
};

const COMMAND_LABELS: Record<PredefinedCommandKey, string> = {
  touch: "Touch",
  reinitialize: "Reinitialize",
  "action-runner": "Action Runner",
};

const COMMAND_KEYS: PredefinedCommandKey[] = ["reinitialize", "touch", "action-runner"];

export function PredefinedCommandsTab({ config, onSave }: Props): JSX.Element {
  const [isSavingRow, setIsSavingRow] = useState<string | null>(null);
  const [aliasDrafts, setAliasDrafts] = useState<Record<PredefinedCommandKey, string>>({
    touch: config.ui.predefinedCommands.touch.alias,
    reinitialize: config.ui.predefinedCommands.reinitialize.alias,
    "action-runner": config.ui.predefinedCommands["action-runner"].alias,
  });

  useEffect(() => {
    setAliasDrafts({
      touch: config.ui.predefinedCommands.touch.alias,
      reinitialize: config.ui.predefinedCommands.reinitialize.alias,
      "action-runner": config.ui.predefinedCommands["action-runner"].alias,
    });
  }, [config]);

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
      {COMMAND_KEYS.map((commandKey) => {
        const command = config.ui.predefinedCommands[commandKey];
        const commandLabel = COMMAND_LABELS[commandKey];
        const aliasDraft = aliasDrafts[commandKey];
        const isCanonicalAlias = aliasDraft.trim() === commandKey;
        return (
          <article key={commandKey} className="list-row">
            <div className="list-row-main">
              <div>
                <h3 className="list-row-title">{commandLabel}</h3>
                <p className="list-row-subtitle">{COMMAND_DESCRIPTION[commandKey]}</p>
              </div>
              <div className="row-right">
                <label className="toggle" aria-label={`Toggle ${commandLabel}`}>
                  <input
                    type="checkbox"
                    checked={command.enabled}
                    onChange={(event) =>
                      void updateCommand(commandKey, { enabled: event.target.checked })
                    }
                  />
                  <span className="slider" />
                </label>
                <label className="field-block">
                  <span className="label-caption">Command alias</span>
                  <input
                    className={isCanonicalAlias ? "alias-input is-placeholder" : "alias-input"}
                    value={isCanonicalAlias ? "" : aliasDraft}
                    placeholder={commandKey}
                    onChange={(event) =>
                      setAliasDrafts((previousDrafts) => ({
                        ...previousDrafts,
                        [commandKey]: event.target.value,
                      }))
                    }
                    onBlur={() =>
                      void updateCommand(commandKey, {
                        alias: aliasDraft.trim().length > 0 ? aliasDraft : commandKey,
                      })
                    }
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") {
                        return;
                      }
                      event.currentTarget.blur();
                    }}
                  />
                </label>
                <span className="status-text">
                  {isSavingRow === commandKey
                    ? "Saving..."
                    : command.enabled
                      ? "Enabled"
                      : "Disabled"}
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
