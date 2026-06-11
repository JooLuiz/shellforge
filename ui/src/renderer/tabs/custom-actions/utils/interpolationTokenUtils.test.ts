import { describe, expect, it } from "vitest";
import {
  applyContextTokenCompletion,
  filterVariablesByPartialName,
  findActiveContextToken,
  formatContextVariableOption,
  SYSTEM_VARIABLE_OPTION_LABEL,
  SYSTEM_VARIABLE_OPTION_VALUE,
} from "./interpolationTokenUtils";

describe("interpolationTokenUtils", () => {
  it("finds an active context token inside a larger string", () => {
    const textBeforeCursor = "https://host/{{context.us";

    expect(findActiveContextToken(textBeforeCursor)).toEqual({
      tokenStart: 13,
      partialName: "us",
    });
  });

  it("returns null when no active context token is present", () => {
    expect(findActiveContextToken("https://host/{{context.userId}}")).toBeNull();
  });

  it("filters variables by partial name case-insensitively", () => {
    expect(filterVariablesByPartialName(["userId", "token", "taskId"], "tok")).toEqual(["token"]);
  });

  it("completes only the active token segment and preserves suffix text", () => {
    const fullValue = "https://host/{{context.us/path";
    const tokenStart = 13;
    const cursorPosition = 25;

    expect(
      applyContextTokenCompletion(fullValue, tokenStart, cursorPosition, "userId"),
    ).toEqual({
      nextValue: "https://host/{{context.userId}}/path",
      nextCursor: 31,
    });
  });

  it("formats context variable datalist values and system variable option", () => {
    expect(formatContextVariableOption("token")).toBe("{{context.token}}");
    expect(SYSTEM_VARIABLE_OPTION_VALUE).toBe("{{env.}}");
    expect(SYSTEM_VARIABLE_OPTION_LABEL).toBe("System variable");
  });
});
