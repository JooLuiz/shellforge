import { useMemo } from "react";

import { collectActionArgumentSchema } from "../../../../shared/actionArgumentSchema";
import {
  buildAliasToActionMap,
  composeScheduledTaskCommand,
  createInitialActionArgs,
  getCommandInputValue,
  parseScheduledCommandDraft,
  type ScheduledCommandDraft,
} from "../../../../shared/scheduledTaskCommand";
import type { ActionConfig, CustomActionUiConfig, ScheduledTaskCommandMetadata } from "../../../../shared/types";

export function createEmptyCommandDraft(): ScheduledCommandDraft {
  return {
    kind: "custom",
    alias: "",
    actionName: null,
    verbose: false,
    actionArgs: {},
    customCommand: "",
  };
}

export function hydrateCommandDraft(
  command: string,
  commandMetadata: ScheduledTaskCommandMetadata | undefined,
  customActions: Record<string, CustomActionUiConfig>,
): ScheduledCommandDraft {
  const aliasMap = buildAliasToActionMap(customActions);
  return parseScheduledCommandDraft(command, commandMetadata ?? null, aliasMap);
}

export function getCommandInputFieldUpdate(
  draft: ScheduledCommandDraft,
  commandInput: string,
): Pick<ScheduledCommandDraft, "alias" | "customCommand"> {
  if (draft.kind === "customActionAlias") {
    return { alias: commandInput, customCommand: draft.customCommand };
  }

  return { alias: draft.alias, customCommand: commandInput };
}

export function applyCommandInputChange(
  previousDraft: ScheduledCommandDraft,
  commandInput: string,
  customActions: Record<string, CustomActionUiConfig>,
  actionRunner: Record<string, ActionConfig>,
): ScheduledCommandDraft {
  const trimmedInput = commandInput.trim();
  const aliasMap = buildAliasToActionMap(customActions);
  const firstToken = trimmedInput.split(/\s+/)[0] ?? "";
  const resolvedAction = aliasMap.get(trimmedInput) ?? aliasMap.get(firstToken);

  if (resolvedAction) {
    const actionChanged = previousDraft.actionName !== resolvedAction.actionName;
    if (actionChanged) {
      const withSelection = applyAliasSelection(
        previousDraft,
        resolvedAction.primaryAlias,
        customActions,
        actionRunner,
      );
      return {
        ...withSelection,
        verbose: previousDraft.verbose,
      };
    }

    return {
      kind: "customActionAlias",
      alias: resolvedAction.primaryAlias,
      actionName: resolvedAction.actionName,
      verbose: previousDraft.verbose,
      actionArgs: previousDraft.actionArgs,
      customCommand: previousDraft.customCommand,
    };
  }

  return {
    kind: "custom",
    alias: "",
    actionName: null,
    verbose: previousDraft.verbose,
    actionArgs: {},
    customCommand: commandInput,
  };
}

export function applyAliasSelection(
  previousDraft: ScheduledCommandDraft,
  nextAlias: string,
  customActions: Record<string, CustomActionUiConfig>,
  actionRunner: Record<string, ActionConfig>,
): ScheduledCommandDraft {
  const aliasMap = buildAliasToActionMap(customActions);
  const resolvedAction = aliasMap.get(nextAlias.trim());

  if (!resolvedAction) {
    return {
      ...previousDraft,
      kind: "custom",
      alias: "",
      actionName: null,
      actionArgs: {},
      customCommand: nextAlias,
    };
  }

  const actionConfig = actionRunner[resolvedAction.actionName];
  const schema = actionConfig ? collectActionArgumentSchema(actionConfig) : null;

  return {
    kind: "customActionAlias",
    alias: resolvedAction.primaryAlias,
    actionName: resolvedAction.actionName,
    verbose: previousDraft.verbose,
    actionArgs: schema ? createInitialActionArgs(schema) : {},
    customCommand: previousDraft.customCommand,
  };
}

export function mergeCommandDraftIntoTaskInput<T extends { command: string; commandMetadata?: unknown }>(
  taskInput: T,
  commandDraft: ScheduledCommandDraft,
): T {
  const composed = composeScheduledTaskCommand(commandDraft);
  return {
    ...taskInput,
    command: composed.command,
    commandMetadata: composed.commandMetadata,
  };
}

export function resolveArgumentSchema(
  commandDraft: ScheduledCommandDraft,
  actionRunner: Record<string, ActionConfig>,
) {
  if (commandDraft.kind !== "customActionAlias" || !commandDraft.actionName) {
    return null;
  }

  const actionConfig = actionRunner[commandDraft.actionName];
  if (!actionConfig) {
    return null;
  }

  return collectActionArgumentSchema(actionConfig);
}

export function useScheduledTaskCommandContext(
  customActions: Record<string, CustomActionUiConfig>,
  actionRunner: Record<string, ActionConfig>,
) {
  return useMemo(
    () => ({
      aliasMap: buildAliasToActionMap(customActions),
      actionRunner,
      customActions,
    }),
    [actionRunner, customActions],
  );
}
