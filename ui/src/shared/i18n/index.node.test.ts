/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, persistLocale, readStoredLocale } from "./index";

describe("shared i18n (node)", () => {
  it("falls back when localStorage is unavailable", () => {
    expect(readStoredLocale()).toBe(DEFAULT_LOCALE);
    expect(() => persistLocale("pt-BR")).not.toThrow();
  });
});
