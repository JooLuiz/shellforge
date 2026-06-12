import { describe, expect, it } from "vitest";
import { mapScheduledTaskToggleErrorMessage } from "./scheduledTaskToggleErrors";

describe("mapScheduledTaskToggleErrorMessage", () => {
  const messages = {
    adminRequiredErrorMessage: "admin",
    invalidActionNameMessage: "invalid name",
    toggleFailedMessage: "toggle failed",
    toggleRegistrationFailedMessage: "registration failed",
  };

  it("maps administrator errors", () => {
    expect(
      mapScheduledTaskToggleErrorMessage("Administrator privileges are required", messages),
    ).toBe("admin");
  });

  it("maps invalid action name errors", () => {
    expect(
      mapScheduledTaskToggleErrorMessage(
        "Task name must use only ASCII letters, numbers, spaces, hyphens, and underscores.",
        messages,
      ),
    ).toBe("invalid name");
  });

  it("maps registration verification errors", () => {
    expect(
      mapScheduledTaskToggleErrorMessage(
        "The Windows scheduled task was not registered. Check the task name and try again.",
        messages,
      ),
    ).toBe("registration failed");
  });
});
