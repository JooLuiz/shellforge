/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  formatMessage,
  getDictionary,
  isLocale,
  persistLocale,
  readStoredLocale,
} from "./index";

describe("shared i18n", () => {
  it("validates supported locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("pt-BR")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });

  it("returns dictionaries for each locale", () => {
    expect(getDictionary("en").app.brandTitle).toBe("ShellForge");
    expect(getDictionary("pt-BR").app.brandTitle).toBe("ShellForge");
    expect(getDictionary("pt-BR").tabs.custom).toContain("Personalizadas");
  });

  it("falls back to the default locale when storage is missing", () => {
    expect(readStoredLocale()).toBe(DEFAULT_LOCALE);
  });

  it("persists supported locales in storage", () => {
    persistLocale("pt-BR");
    expect(localStorage.getItem("shell-forge-locale")).toBe("pt-BR");
    expect(readStoredLocale()).toBe("pt-BR");
  });

  it("falls back to the default locale when storage contains an invalid value", () => {
    localStorage.setItem("shell-forge-locale", "invalid-locale");
    expect(readStoredLocale()).toBe(DEFAULT_LOCALE);
  });

  it("interpolates template placeholders with formatMessage", () => {
    expect(formatMessage("Delete action {itemName}?", { itemName: "fetchData" })).toBe(
      "Delete action fetchData?",
    );
    expect(formatMessage("No placeholders", {})).toBe("No placeholders");
  });
});
