import type {
  AppConfig,
  CustomActionUiConfig,
  PredefinedCommandConfig,
  PredefinedCommandKey,
  UiConfig,
} from "./types";
import { PREDEFINED_COMMAND_KEYS } from "./predefinedCommandsRegistry";

function sanitizeAlias(aliasCandidate: unknown, fallbackAlias: string): string {
  if (typeof aliasCandidate !== "string") {
    return fallbackAlias;
  }

  const trimmedAlias = aliasCandidate.trim();
  return trimmedAlias.length > 0 ? trimmedAlias : fallbackAlias;
}

function normalizePredefinedCommand(
  key: PredefinedCommandKey,
  valueCandidate: unknown
): PredefinedCommandConfig {
  if (!valueCandidate || typeof valueCandidate !== "object") {
    return {
      enabled: false,
      alias: key,
    };
  }

  const typedValue = valueCandidate as Record<string, unknown>;
  return {
    enabled: typedValue.enabled === true,
    alias: sanitizeAlias(typedValue.alias, key),
  };
}

function normalizeCustomActionConfig(
  actionName: string,
  valueCandidate: unknown
): CustomActionUiConfig {
  if (!valueCandidate || typeof valueCandidate !== "object") {
    return {
      availableOnCLI: false,
      aliases: [actionName],
    };
  }

  const typedValue = valueCandidate as Record<string, unknown>;
  const aliasesCandidate = Array.isArray(typedValue.aliases)
    ? typedValue.aliases.filter((alias) => typeof alias === "string")
    : [actionName];

  const aliases = Array.from(
    new Set(
      aliasesCandidate
        .map((alias) => sanitizeAlias(alias, actionName))
        .filter((alias) => alias.length > 0)
    )
  );

  return {
    availableOnCLI: typedValue.availableOnCLI === true || typedValue.exposeInProfile === true,
    aliases: aliases.length > 0 ? aliases : [actionName],
  };
}

export function normalizeUiConfig(configCandidate: Record<string, unknown>): UiConfig {
  const currentUiConfig =
    configCandidate.ui && typeof configCandidate.ui === "object"
      ? (configCandidate.ui as Record<string, unknown>)
      : {};

  const predefinedCandidate =
    currentUiConfig.predefinedCommands && typeof currentUiConfig.predefinedCommands === "object"
      ? (currentUiConfig.predefinedCommands as Record<string, unknown>)
      : {};

  const customCandidate =
    currentUiConfig.customActions && typeof currentUiConfig.customActions === "object"
      ? (currentUiConfig.customActions as Record<string, unknown>)
      : {};

  const predefinedCommands = PREDEFINED_COMMAND_KEYS.reduce(
    (accumulator, commandKey) => ({
      ...accumulator,
      [commandKey]: normalizePredefinedCommand(commandKey, predefinedCandidate[commandKey]),
    }),
    {} as Record<PredefinedCommandKey, PredefinedCommandConfig>
  );

  const actionRunner =
    configCandidate.actionRunner && typeof configCandidate.actionRunner === "object"
      ? (configCandidate.actionRunner as Record<string, unknown>)
      : {};

  const customActions = Object.keys(actionRunner).reduce(
    (accumulator, actionName) => ({
      ...accumulator,
      [actionName]: normalizeCustomActionConfig(actionName, customCandidate[actionName]),
    }),
    {} as Record<string, CustomActionUiConfig>
  );

  return {
    predefinedCommands,
    customActions,
  };
}

export function ensureAppConfig(configCandidate: Record<string, unknown>): AppConfig {
  const actionRunner =
    configCandidate.actionRunner && typeof configCandidate.actionRunner === "object"
      ? (configCandidate.actionRunner as Record<string, unknown>)
      : {};

  const normalizedUi = normalizeUiConfig({
    ...configCandidate,
    actionRunner,
  });

  return {
    ...configCandidate,
    actionRunner,
    ui: normalizedUi,
  } as AppConfig;
}
