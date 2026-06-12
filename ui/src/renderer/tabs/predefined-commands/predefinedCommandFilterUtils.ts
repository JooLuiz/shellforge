import {
  PREDEFINED_COMMAND_CATEGORY_LABELS,
  PREDEFINED_COMMAND_DEFINITIONS,
  type PredefinedCommandCategory,
  type PredefinedCommandKey,
} from "../../../shared/predefinedCommandsRegistry";
import type { AppConfig } from "../../../shared/types";

export type PredefinedCommandFilterCategory = PredefinedCommandCategory | "all";

export interface PredefinedCommandFilterContext {
  commandKey: PredefinedCommandKey;
  label: string;
  description: string;
  category: PredefinedCommandCategory;
  categoryLabel: string;
  alias: string;
}

export function buildPredefinedCommandFilterContexts(
  config: AppConfig
): PredefinedCommandFilterContext[] {
  return PREDEFINED_COMMAND_DEFINITIONS.map((definition) => ({
    commandKey: definition.key,
    label: definition.label,
    description: definition.description,
    category: definition.category,
    categoryLabel: PREDEFINED_COMMAND_CATEGORY_LABELS[definition.category],
    alias: config.ui.predefinedCommands[definition.key].alias,
  }));
}

export function filterPredefinedCommands(
  contexts: PredefinedCommandFilterContext[],
  searchQuery: string,
  categoryFilter: PredefinedCommandFilterCategory
): PredefinedCommandFilterContext[] {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  return contexts.filter((context) => {
    const matchesCategory =
      categoryFilter === "all" || context.category === categoryFilter;

    if (!matchesCategory) {
      return false;
    }

    if (normalizedSearchQuery.length === 0) {
      return true;
    }

    const searchableValues = [
      context.commandKey,
      context.label,
      context.description,
      context.alias,
      context.categoryLabel,
      context.category,
    ];

    return searchableValues.some((value) =>
      value.toLowerCase().includes(normalizedSearchQuery)
    );
  });
}
