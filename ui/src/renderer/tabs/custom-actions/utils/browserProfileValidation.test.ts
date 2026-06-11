import { describe, expect, it } from "vitest";
import { validateBrowserProfileKey } from "./browserProfileValidation";

describe("validateBrowserProfileKey", () => {
  it("returns null for empty values", () => {
    expect(validateBrowserProfileKey("")).toBeNull();
    expect(validateBrowserProfileKey("   ")).toBeNull();
  });

  it("returns null for valid profile keys", () => {
    expect(validateBrowserProfileKey("clockify")).toBeNull();
  });

  it("rejects path separators", () => {
    expect(validateBrowserProfileKey("foo/bar")).toBe(
      'Use only a profile key (for example "clockify"), not a path.',
    );
  });

  it("rejects traversal", () => {
    expect(validateBrowserProfileKey("..")).toBe('".." is not allowed.');
  });
});
