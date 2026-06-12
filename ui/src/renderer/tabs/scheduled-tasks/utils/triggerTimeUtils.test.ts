import { describe, expect, it } from "vitest";
import {
  buildHourOptions,
  buildMinuteOptions,
  formatTriggerTime,
  isDuplicateTriggerTime,
  parseTriggerTime,
  sortTriggerTimes,
} from "./triggerTimeUtils";

describe("triggerTimeUtils", () => {
  it("formats trigger times with zero padding", () => {
    expect(formatTriggerTime(8, 5)).toBe("08:05");
    expect(formatTriggerTime(23, 59)).toBe("23:59");
    expect(formatTriggerTime(0, 0)).toBe("00:00");
  });

  it("parses valid trigger times", () => {
    expect(parseTriggerTime("08:05")).toEqual({ hour: 8, minute: 5 });
    expect(parseTriggerTime("23:59")).toEqual({ hour: 23, minute: 59 });
  });

  it("returns null for invalid trigger times", () => {
    expect(parseTriggerTime("24:00")).toBeNull();
    expect(parseTriggerTime("08:60")).toBeNull();
    expect(parseTriggerTime("invalid")).toBeNull();
  });

  it("sorts trigger times lexically", () => {
    expect(sortTriggerTimes(["12:00", "08:30", "09:15"])).toEqual([
      "08:30",
      "09:15",
      "12:00",
    ]);
  });

  it("detects duplicate trigger times", () => {
    const times = ["08:00", "12:00"];

    expect(isDuplicateTriggerTime(times, "12:00")).toBe(true);
    expect(isDuplicateTriggerTime(times, "09:00")).toBe(false);
    expect(isDuplicateTriggerTime(times, "12:00", 1)).toBe(false);
    expect(isDuplicateTriggerTime(times, "08:00", 0)).toBe(false);
  });

  it("builds hour and minute options", () => {
    expect(buildHourOptions()).toEqual([
      "00",
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
    ]);
    expect(buildMinuteOptions()).toHaveLength(60);
    expect(buildMinuteOptions()[0]).toBe("00");
    expect(buildMinuteOptions()[59]).toBe("59");
  });
});
