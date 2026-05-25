import type { Dispatch, SetStateAction } from "react";
import type { AppConfig } from "../../../../shared/types";
import type { RowMetadataPatch } from "../types";

function normalizeAliasValue(aliasCandidate: string, actionName: string): string {
  const normalizedAliasCandidate = aliasCandidate.trim();
  return normalizedAliasCandidate.length > 0 ? normalizedAliasCandidate : actionName;
}

interface CustomActionsListProps {
  actionNames: string[];
  aliasDraftByActionName: Record<string, string>;
  config: AppConfig;
  deleteAction: (actionName: string) => Promise<boolean>;
  onEditAction: (actionName: string) => void;
  onRunAction: (actionName: string) => void;
  rowPendingByActionName: Record<string, boolean>;
  saveRowMetadata: (actionName: string, metadataPatch: RowMetadataPatch) => Promise<boolean>;
  setAliasDraftByActionName: Dispatch<SetStateAction<Record<string, string>>>;
}

export function CustomActionsList({
  actionNames,
  aliasDraftByActionName,
  config,
  deleteAction,
  onEditAction,
  onRunAction,
  rowPendingByActionName,
  saveRowMetadata,
  setAliasDraftByActionName,
}: CustomActionsListProps): JSX.Element {
  const setAliasDraftForAction = (actionName: string, nextAliasDraft: string): void => {
    setAliasDraftByActionName((previousDraftByActionName) => ({
      ...previousDraftByActionName,
      [actionName]: nextAliasDraft,
    }));
  };

  return (
    <>
      {actionNames.map((actionName) => {
        const customActionUi = config.ui.customActions[actionName];
        const primaryAlias = customActionUi?.aliases[0] ?? actionName;
        const normalizedPrimaryAlias = normalizeAliasValue(primaryAlias, actionName);
        const aliasDraftValue = aliasDraftByActionName[actionName] ?? primaryAlias;
        const isCanonicalAlias = aliasDraftValue.trim() === actionName;
        const isRowPending = rowPendingByActionName[actionName] ?? false;
        return (
          <article key={actionName} className="list-row">
            <div className="list-row-main custom-row-main">
              <div className="row-left custom-row-left">
                <h3 className="list-row-title">{actionName}</h3>
                <div className="row-actions">
                  <button
                    type="button"
                    className="button button-blue"
                    disabled={isRowPending}
                    onClick={() => onEditAction(actionName)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="button button-red"
                    disabled={isRowPending}
                    onClick={() => {
                      void deleteAction(actionName);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="row-right custom-row-right">
                <div className="row-right-top custom-row-right-top">
                  <span className="label-caption">Available on CLI</span>
                  <label
                    className="toggle"
                    aria-label={`Toggle CLI availability for ${actionName}`}
                  >
                    <input
                      type="checkbox"
                      checked={customActionUi?.availableOnCLI ?? false}
                      disabled={isRowPending}
                      onChange={(event) =>
                        void saveRowMetadata(actionName, {
                          availableOnCLI: event.target.checked,
                        })
                      }
                    />
                    <span className="slider" />
                  </label>
                </div>
                <div className="row-right-bottom custom-row-right-bottom">
                  <button
                    type="button"
                    className="button button-green"
                    disabled={isRowPending}
                    onClick={() => onRunAction(actionName)}
                  >
                    Run Now
                  </button>
                  <label className="field-block inline-alias-field">
                    <span className="label-caption">Command alias</span>
                    <input
                      className={
                        isCanonicalAlias ? "alias-input is-placeholder" : "alias-input"
                      }
                      disabled={isRowPending}
                      value={isCanonicalAlias ? "" : aliasDraftValue}
                      placeholder={actionName}
                      onChange={(event) =>
                        setAliasDraftForAction(actionName, event.target.value)
                      }
                      onBlur={(event) => {
                        void (async () => {
                          const normalizedAliasDraft = normalizeAliasValue(
                            event.currentTarget.value,
                            actionName,
                          );
                          if (normalizedAliasDraft === normalizedPrimaryAlias) {
                            setAliasDraftForAction(actionName, normalizedPrimaryAlias);
                            return;
                          }

                          const didSaveAlias = await saveRowMetadata(actionName, {
                            primaryAlias: normalizedAliasDraft,
                          });
                          if (didSaveAlias) {
                            setAliasDraftForAction(actionName, normalizedAliasDraft);
                          }
                        })();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.currentTarget.blur();
                          return;
                        }

                        if (event.key === "Escape") {
                          setAliasDraftForAction(actionName, normalizedPrimaryAlias);
                          event.currentTarget.blur();
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </>
  );
}
