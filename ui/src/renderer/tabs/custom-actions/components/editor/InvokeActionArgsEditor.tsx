import { useEffect, useMemo } from "react";
import type { ActionConfig, ActionStep } from "../../../../../shared/types";
import type { StepUpdater } from "../../types";
import type { FlowValidationSeverity } from "../../utils/flowValidationUtils";
import { getFieldBlockClassName } from "../../utils/flowValidationUtils";
import { collectRequiredArgs } from "../../utils/actionConfigUtils";
import { isRecord } from "../../utils/stepUtils";
import { FieldHint } from "./FieldHint";
import { InterpolatedStringField } from "./InterpolatedStringField";

interface InvokeActionArgsEditorProps {
  actionRunner: Record<string, ActionConfig>;
  availableVariables: readonly string[];
  fieldValidationByKey: Map<string, FlowValidationSeverity>;
  invokedActionName: string;
  value: unknown;
  updateSelectedStep: (updater: StepUpdater) => void;
}

function getArgsRecord(step: ActionStep): Record<string, unknown> {
  return isRecord(step.args) ? step.args : {};
}

export function InvokeActionArgsEditor({
  actionRunner,
  availableVariables,
  fieldValidationByKey,
  invokedActionName,
  value,
  updateSelectedStep,
}: InvokeActionArgsEditorProps): JSX.Element {
  const argsRecord = isRecord(value) ? value : {};
  const invokedConfig = actionRunner[invokedActionName];
  const requiredArgNames = useMemo(
    () => (invokedConfig ? collectRequiredArgs(invokedConfig) : []),
    [invokedConfig, invokedActionName],
  );
  const requiredArgNamesKey = requiredArgNames.join("\0");
  const requiredArgSet = new Set(requiredArgNames);

  useEffect(() => {
    if (invokedActionName.trim().length === 0) {
      return;
    }

    updateSelectedStep((stepDraft) => {
      const currentArgs = getArgsRecord(stepDraft);
      let hasMissingRequiredKey = false;
      const nextArgs: Record<string, unknown> = { ...currentArgs };

      requiredArgNames.forEach((requiredArgName) => {
        if (!(requiredArgName in nextArgs)) {
          nextArgs[requiredArgName] = "";
          hasMissingRequiredKey = true;
        }
      });

      if (!hasMissingRequiredKey) {
        return stepDraft;
      }

      return { ...stepDraft, args: nextArgs };
    });
  }, [invokedActionName, requiredArgNamesKey, requiredArgNames, updateSelectedStep]);

  const optionalEntries = Object.entries(argsRecord).filter(
    ([entryKey]) => !requiredArgSet.has(entryKey),
  );

  return (
    <div className="field-block">
      <span>Args</span>
      <FieldHint
        hint="Arguments passed to the invoked action — required args are locked and must be filled before save"
        example="username: {{context.user}}"
      />
      <div className="object-editor">
        {requiredArgNames.map((requiredArgName) => (
          <div
            key={`required-${requiredArgName}`}
            className={getFieldBlockClassName(
              "object-editor-row object-editor-row--required",
              fieldValidationByKey.get(`args.${requiredArgName}`),
            )}
          >
            <input value={requiredArgName} readOnly aria-readonly className="object-editor-key--locked" />
            <InterpolatedStringField
              value={typeof argsRecord[requiredArgName] === "string" ? argsRecord[requiredArgName] : ""}
              availableVariables={availableVariables}
              onChange={(nextValue) =>
                updateSelectedStep((stepDraft) => ({
                  ...stepDraft,
                  args: {
                    ...getArgsRecord(stepDraft),
                    [requiredArgName]: nextValue,
                  },
                }))
              }
            />
          </div>
        ))}

        {optionalEntries.map(([entryKey, entryValue], entryIndex) => (
          <div
            key={`optional-${entryIndex}`}
            className={getFieldBlockClassName(
              "object-editor-row",
              fieldValidationByKey.get(`args.${entryKey}`),
            )}
          >
            <input
              value={entryKey}
              placeholder="key"
              onChange={(event) =>
                updateSelectedStep((stepDraft) => {
                  const previousEntries = Object.entries(getArgsRecord(stepDraft)).filter(
                    ([key]) => !requiredArgSet.has(key),
                  );
                  const nextOptionalArgs: Record<string, unknown> = {};
                  previousEntries.forEach(([rawKey, rawValue], index) => {
                    const nextKey = index === entryIndex ? event.target.value.trim() : rawKey;
                    if (nextKey.length === 0) {
                      return;
                    }
                    nextOptionalArgs[nextKey] = rawValue;
                  });

                  const nextArgs: Record<string, unknown> = {};
                  requiredArgNames.forEach((requiredArgName) => {
                    nextArgs[requiredArgName] = getArgsRecord(stepDraft)[requiredArgName] ?? "";
                  });
                  Object.assign(nextArgs, nextOptionalArgs);

                  return { ...stepDraft, args: nextArgs };
                })
              }
            />
            {typeof entryValue === "string" ? (
              <InterpolatedStringField
                value={entryValue}
                availableVariables={availableVariables}
                onChange={(nextValue) =>
                  updateSelectedStep((stepDraft) => ({
                    ...stepDraft,
                    args: {
                      ...getArgsRecord(stepDraft),
                      [entryKey]: nextValue,
                    },
                  }))
                }
              />
            ) : (
              <input
                value={JSON.stringify(entryValue)}
                placeholder="value"
                onChange={(event) =>
                  updateSelectedStep((stepDraft) => ({
                    ...stepDraft,
                    args: {
                      ...getArgsRecord(stepDraft),
                      [entryKey]: event.target.value,
                    },
                  }))
                }
              />
            )}
            <button
              type="button"
              className="button button-red"
              onClick={() =>
                updateSelectedStep((stepDraft) => {
                  const nextArgs = { ...getArgsRecord(stepDraft) };
                  delete nextArgs[entryKey];
                  return { ...stepDraft, args: nextArgs };
                })
              }
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          className="button button-blue"
          onClick={() =>
            updateSelectedStep((stepDraft) => {
              const currentArgs = getArgsRecord(stepDraft);
              let optionalIndex = 1;
              let candidateKey = `arg${optionalIndex}`;
              while (candidateKey in currentArgs) {
                optionalIndex += 1;
                candidateKey = `arg${optionalIndex}`;
              }

              return {
                ...stepDraft,
                args: {
                  ...currentArgs,
                  [candidateKey]: "",
                },
              };
            })
          }
        >
          Add Entry
        </button>
      </div>
    </div>
  );
}
