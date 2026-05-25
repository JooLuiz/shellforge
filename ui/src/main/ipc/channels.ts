export const IPC_CHANNELS = {
  configRead: "config:read",
  configWrite: "config:write",
  profileStatus: "profile:status",
  profileRegenerate: "profile:regenerate",
  scheduledTasksList: "scheduledTasks:list",
  scheduledTasksSave: "scheduledTasks:save",
  scheduledTasksDelete: "scheduledTasks:delete",
  scheduledTasksToggle: "scheduledTasks:toggle",
  customActionsRun: "customActions:run",
} as const;
