const TRIGGER_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export interface TriggerTimeParts {
  hour: number;
  minute: number;
}

export function formatTriggerTime(hour: number, minute: number): string {
  const paddedHour = String(hour).padStart(2, "0");
  const paddedMinute = String(minute).padStart(2, "0");
  return `${paddedHour}:${paddedMinute}`;
}

export function parseTriggerTime(value: string): TriggerTimeParts | null {
  const match = value.match(TRIGGER_TIME_PATTERN);
  if (!match) {
    return null;
  }

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
}

export function sortTriggerTimes(times: string[]): string[] {
  return [...times].sort((leftTime, rightTime) => leftTime.localeCompare(rightTime));
}

export function isDuplicateTriggerTime(
  times: string[],
  candidate: string,
  excludeIndex?: number,
): boolean {
  return times.some((time, index) => index !== excludeIndex && time === candidate);
}

export function buildHourOptions(): string[] {
  return Array.from({ length: 24 }, (_entry, hour) => formatTriggerTime(hour, 0).slice(0, 2));
}

export function buildMinuteOptions(): string[] {
  return Array.from({ length: 60 }, (_entry, minute) => String(minute).padStart(2, "0"));
}

export const DEFAULT_TRIGGER_TIME = "08:00";
