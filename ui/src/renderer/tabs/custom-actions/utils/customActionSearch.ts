import type { AppConfig } from "../../../../shared/types";

export function filterCustomActionNames(
  actionNames: string[],
  config: AppConfig,
  searchQuery: string
): string[] {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  if (normalizedSearchQuery.length === 0) {
    return actionNames;
  }

  return actionNames.filter((actionName) => {
    const customActionUi = config.ui.customActions[actionName];
    const searchableValues = [
      actionName,
      ...(customActionUi?.aliases ?? []),
    ];

    return searchableValues.some((value) =>
      value.toLowerCase().includes(normalizedSearchQuery)
    );
  });
}
