import { describe, expect, it } from "vitest";
import {
  getScheduledTaskActionNameFormatError,
  validateScheduledTaskActionName,
} from "./scheduledTaskActionName";

describe("validateScheduledTaskActionName", () => {
  it("accepts ASCII task names with spaces and hyphens", () => {
    expect(validateScheduledTaskActionName("Lancar Horas")).toBeNull();
    expect(validateScheduledTaskActionName("Bater-Ponto")).toBeNull();
    expect(validateScheduledTaskActionName("Task_1")).toBeNull();
  });

  it("rejects accented characters and symbols", () => {
    expect(validateScheduledTaskActionName("Lançar Horas")).not.toBeNull();
    expect(validateScheduledTaskActionName("Task:Name")).not.toBeNull();
    expect(validateScheduledTaskActionName("Task\\Name")).not.toBeNull();
  });

  it("rejects leading or trailing separators and empty names", () => {
    expect(validateScheduledTaskActionName(" Lancar Horas")).not.toBeNull();
    expect(validateScheduledTaskActionName("Lancar Horas ")).not.toBeNull();
    expect(validateScheduledTaskActionName("   ")).not.toBeNull();
  });
});

describe("getScheduledTaskActionNameFormatError", () => {
  it("returns null for empty, whitespace-only, and valid ASCII names", () => {
    expect(getScheduledTaskActionNameFormatError("")).toBeNull();
    expect(getScheduledTaskActionNameFormatError("   ")).toBeNull();
    expect(getScheduledTaskActionNameFormatError("Lancar Horas")).toBeNull();
    expect(getScheduledTaskActionNameFormatError("Bater-Ponto")).toBeNull();
  });

  it("returns an error for invalid characters when the field has content", () => {
    expect(getScheduledTaskActionNameFormatError("Lançar Horas")).not.toBeNull();
    expect(getScheduledTaskActionNameFormatError("Task:Name")).not.toBeNull();
    expect(getScheduledTaskActionNameFormatError(" Lancar Horas")).not.toBeNull();
    expect(getScheduledTaskActionNameFormatError("Lancar Horas ")).not.toBeNull();
  });
});
