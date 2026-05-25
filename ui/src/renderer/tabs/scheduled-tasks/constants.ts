import type { ScheduledTaskInput } from "../../../shared/types";

export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const WEEKDAY_SHORT_LABELS: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

export const EMPTY_FORM: ScheduledTaskInput = {
  actionName: "",
  triggerTimes: [],
  weekdays: [],
  command: "",
};

export const CUSTOM_COMMAND_VALUE = "__custom__";
export const EDIT_AUTOSAVE_DELAY_MS = 10000;
