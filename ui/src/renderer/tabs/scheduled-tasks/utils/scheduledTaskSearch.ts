import type { ScheduledTaskRecord } from "../../../../shared/types";

export function filterScheduledTasks(
  scheduledTasks: ScheduledTaskRecord[],
  searchQuery: string
): ScheduledTaskRecord[] {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  if (normalizedSearchQuery.length === 0) {
    return scheduledTasks;
  }

  return scheduledTasks.filter((scheduledTask) => {
    const searchableValues = [
      scheduledTask.fileName,
      scheduledTask.actionName,
      scheduledTask.command,
      ...scheduledTask.triggerTimes,
      ...scheduledTask.weekdays,
    ];

    return searchableValues.some((value) =>
      value.toLowerCase().includes(normalizedSearchQuery)
    );
  });
}
