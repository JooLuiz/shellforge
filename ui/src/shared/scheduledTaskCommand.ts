import type {
  CustomActionUiConfig,
  ScheduledTaskCommandMetadata,
} from "./types";

export interface ResolvedCustomActionAlias {
  actionName: string;
  primaryAlias: string;
}

export interface ScheduledCommandDraft {
  kind: "customActionAlias" | "custom";
  alias: string;
  actionName: string | null;
  verbose: boolean;
  actionArgs: Record<string, string>;
  customCommand: string;
}

export interface BuildScheduledCommandInput {
  alias: string;
  verbose: boolean;
  actionArgs: Record<string, string>;
}

const CLI_ARG_PREFIX = "--arg.";

function quoteArgValue(value: string): string {
  if (/\s/.test(value)) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return value;
}

export function buildScheduledCommandString(input: BuildScheduledCommandInput): string {
  const tokens = [input.alias.trim()];
  if (!tokens[0]) {
    return "";
  }

  if (input.verbose) {
    tokens.push("-v");
  }

  Object.entries(input.actionArgs)
    .filter(([, value]) => value.trim().length > 0)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .forEach(([argName, argValue]) => {
      tokens.push(`${CLI_ARG_PREFIX}${argName}=${quoteArgValue(argValue.trim())}`);
    });

  return tokens.join(" ");
}

export function resolveCustomActionFromAlias(
  alias: string,
  customActions: Record<string, CustomActionUiConfig>,
): ResolvedCustomActionAlias | null {
  const normalizedAlias = alias.trim();
  if (!normalizedAlias) {
    return null;
  }

  for (const [actionName, customActionConfig] of Object.entries(customActions)) {
    if (!customActionConfig.availableOnCLI) {
      continue;
    }

    const primaryAlias = customActionConfig.aliases[0]?.trim();
    if (!primaryAlias) {
      continue;
    }

    const aliasMatches = customActionConfig.aliases.some(
      (candidateAlias) => candidateAlias.trim() === normalizedAlias,
    );
    if (aliasMatches) {
      return { actionName, primaryAlias };
    }
  }

  return null;
}

export function buildAliasToActionMap(
  customActions: Record<string, CustomActionUiConfig>,
): Map<string, ResolvedCustomActionAlias> {
  const aliasMap = new Map<string, ResolvedCustomActionAlias>();

  Object.entries(customActions).forEach(([actionName, customActionConfig]) => {
    if (!customActionConfig.availableOnCLI) {
      return;
    }

    const primaryAlias = customActionConfig.aliases[0]?.trim();
    if (!primaryAlias) {
      return;
    }

    const resolvedAction: ResolvedCustomActionAlias = { actionName, primaryAlias };
    customActionConfig.aliases.forEach((candidateAlias) => {
      const trimmedAlias = candidateAlias.trim();
      if (trimmedAlias.length > 0) {
        aliasMap.set(trimmedAlias, resolvedAction);
      }
    });
  });

  return aliasMap;
}

function parseArgsFromCommand(command: string): Record<string, string> {
  const parsedArgs: Record<string, string> = {};
  const argPattern = /--arg\.([a-zA-Z0-9_.-]+)(?:=("[^"]*"|[^\s]+))?/g;
  let match: RegExpExecArray | null = argPattern.exec(command);

  while (match) {
    const argName = match[1];
    const rawValue = match[2] ?? "true";
    parsedArgs[argName] = rawValue.startsWith('"') && rawValue.endsWith('"')
      ? rawValue.slice(1, -1).replace(/\\"/g, '"')
      : rawValue;
    match = argPattern.exec(command);
  }

  return parsedArgs;
}

function parseVerboseFromCommand(command: string): boolean {
  return /(?:^|\s)(?:-v|--verbose)(?:\s|$)/.test(command);
}

export function getCommandInputValue(draft: ScheduledCommandDraft): string {
  return draft.kind === "customActionAlias" ? draft.alias : draft.customCommand;
}

function appendVerboseFlag(command: string, verbose: boolean): string {
  const trimmedCommand = command.trim();
  if (!trimmedCommand || !verbose || parseVerboseFromCommand(trimmedCommand)) {
    return trimmedCommand;
  }

  return `${trimmedCommand} -v`;
}

function parseAliasFromCommand(
  command: string,
  aliasToActionMap: Map<string, ResolvedCustomActionAlias>,
): string {
  const firstToken = command.trim().split(/\s+/)[0] ?? "";
  if (aliasToActionMap.has(firstToken)) {
    return firstToken;
  }
  return firstToken;
}

export function parseScheduledCommandDraft(
  command: string,
  metadata: ScheduledTaskCommandMetadata | null | undefined,
  aliasToActionMap: Map<string, ResolvedCustomActionAlias>,
): ScheduledCommandDraft {
  if (metadata?.version === 1) {
    if (metadata.kind === "customActionAlias" && metadata.alias) {
      const resolvedAction = aliasToActionMap.get(metadata.alias);
      return {
        kind: "customActionAlias",
        alias: metadata.alias,
        actionName: metadata.actionName ?? resolvedAction?.actionName ?? null,
        verbose: Boolean(metadata.verbose),
        actionArgs: { ...(metadata.actionArgs ?? {}) },
        customCommand: command,
      };
    }

    const trimmedCommand = command.trim();
    return {
      kind: "custom",
      alias: "",
      actionName: null,
      verbose: metadata.verbose ?? parseVerboseFromCommand(trimmedCommand),
      actionArgs: {},
      customCommand: trimmedCommand,
    };
  }

  const trimmedCommand = command.trim();
  const alias = parseAliasFromCommand(trimmedCommand, aliasToActionMap);
  const resolvedAction = aliasToActionMap.get(alias);

  if (resolvedAction) {
    return {
      kind: "customActionAlias",
      alias: resolvedAction.primaryAlias,
      actionName: resolvedAction.actionName,
      verbose: parseVerboseFromCommand(trimmedCommand),
      actionArgs: parseArgsFromCommand(trimmedCommand),
      customCommand: trimmedCommand,
    };
  }

  return {
    kind: "custom",
    alias: "",
    actionName: null,
    verbose: parseVerboseFromCommand(trimmedCommand),
    actionArgs: {},
    customCommand: trimmedCommand,
  };
}

export function buildScheduledCommandMetadata(
  draft: ScheduledCommandDraft,
): ScheduledTaskCommandMetadata | undefined {
  if (draft.kind === "customActionAlias" && draft.alias) {
    const nonEmptyArgs = Object.fromEntries(
      Object.entries(draft.actionArgs).filter(([, value]) => value.trim().length > 0),
    );

    return {
      version: 1,
      kind: "customActionAlias",
      alias: draft.alias,
      actionName: draft.actionName ?? undefined,
      verbose: draft.verbose || undefined,
      actionArgs: Object.keys(nonEmptyArgs).length > 0 ? nonEmptyArgs : undefined,
    };
  }

  if (draft.kind === "custom" && draft.customCommand.trim()) {
    return {
      version: 1,
      kind: "custom",
      verbose: draft.verbose || undefined,
    };
  }

  return undefined;
}

export function composeScheduledTaskCommand(
  draft: ScheduledCommandDraft,
): { command: string; commandMetadata?: ScheduledTaskCommandMetadata } {
  if (draft.kind === "custom") {
    return {
      command: appendVerboseFlag(draft.customCommand, draft.verbose),
      commandMetadata: buildScheduledCommandMetadata(draft),
    };
  }

  const command = buildScheduledCommandString({
    alias: draft.alias,
    verbose: draft.verbose,
    actionArgs: draft.actionArgs,
  });

  return {
    command,
    commandMetadata: buildScheduledCommandMetadata(draft),
  };
}

export function createInitialActionArgs(
  schema: { required: string[]; optional: string[]; defaults: Record<string, string> },
): Record<string, string> {
  const initialArgs: Record<string, string> = {};

  schema.required.forEach((argName) => {
    initialArgs[argName] = schema.defaults[argName] ?? "";
  });

  schema.optional.forEach((argName) => {
    if (!(argName in initialArgs)) {
      initialArgs[argName] = schema.defaults[argName] ?? "";
    }
  });

  return initialArgs;
}

export function validateScheduledCommandDraft(
  draft: ScheduledCommandDraft,
  schema: { required: string[] } | null,
): string | null {
  if (draft.kind === "custom") {
    if (draft.customCommand.trim().length === 0) {
      return "Command cannot be empty.";
    }
    return null;
  }

  if (!draft.alias.trim()) {
    return "Command cannot be empty.";
  }

  if (schema) {
    const missingRequiredArg = schema.required.find(
      (requiredArg) => !(draft.actionArgs[requiredArg]?.trim()),
    );
    if (missingRequiredArg) {
      return `Provide a value for required argument "${missingRequiredArg}".`;
    }
  }

  const composedCommand = buildScheduledCommandString({
    alias: draft.alias,
    verbose: draft.verbose,
    actionArgs: draft.actionArgs,
  });

  if (composedCommand.trim().length === 0) {
    return "Command cannot be empty.";
  }

  return null;
}

export const SCHEDULED_COMMAND_METADATA_PREFIX = "# shellforge:scheduledCommandV1 ";

export function serializeScheduledCommandMetadata(
  metadata: ScheduledTaskCommandMetadata,
): string {
  return `${SCHEDULED_COMMAND_METADATA_PREFIX}${JSON.stringify(metadata)}`;
}

export function parseScheduledCommandMetadataLine(
  content: string,
): ScheduledTaskCommandMetadata | null {
  const metadataLine = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith(SCHEDULED_COMMAND_METADATA_PREFIX));

  if (!metadataLine) {
    return null;
  }

  const jsonPayload = metadataLine.slice(SCHEDULED_COMMAND_METADATA_PREFIX.length).trim();
  try {
    const parsedValue = JSON.parse(jsonPayload) as ScheduledTaskCommandMetadata;
    if (parsedValue.version !== 1) {
      return null;
    }
    return parsedValue;
  } catch {
    return null;
  }
}
