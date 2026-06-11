import type { PredefinedCommandKey } from "../../../shared/types";
import type { PredefinedCommandFilterContext } from "./predefinedCommandFilterUtils";

interface PredefinedCommandRowProps {
  commandContext: PredefinedCommandFilterContext;
  aliasDraft: string;
  enabled: boolean;
  isSaving: boolean;
  onAliasDraftChange: (commandKey: PredefinedCommandKey, nextAliasDraft: string) => void;
  onAliasCommit: (commandKey: PredefinedCommandKey, aliasDraft: string) => void;
  onEnabledChange: (commandKey: PredefinedCommandKey, enabled: boolean) => void;
}

export function PredefinedCommandRow({
  commandContext,
  aliasDraft,
  enabled,
  isSaving,
  onAliasDraftChange,
  onAliasCommit,
  onEnabledChange,
}: PredefinedCommandRowProps): JSX.Element {
  const isCanonicalAlias = aliasDraft.trim() === commandContext.commandKey;

  return (
    <article className="list-row">
      <div className="list-row-main">
        <div>
          <h3 className="list-row-title">{commandContext.label}</h3>
          <p className="list-row-subtitle">{commandContext.description}</p>
        </div>
        <div className="row-right">
          <label className="toggle" aria-label={`Toggle ${commandContext.label}`}>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) =>
                onEnabledChange(commandContext.commandKey, event.target.checked)
              }
            />
            <span className="slider" />
          </label>
          <label className="field-block">
            <span className="label-caption">Command alias</span>
            <input
              className={isCanonicalAlias ? "alias-input is-placeholder" : "alias-input"}
              value={isCanonicalAlias ? "" : aliasDraft}
              placeholder={commandContext.commandKey}
              onChange={(event) =>
                onAliasDraftChange(commandContext.commandKey, event.target.value)
              }
              onBlur={() => onAliasCommit(commandContext.commandKey, aliasDraft)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") {
                  return;
                }
                event.currentTarget.blur();
              }}
            />
          </label>
          <span className="status-text">
            {isSaving ? "Saving..." : enabled ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>
    </article>
  );
}
