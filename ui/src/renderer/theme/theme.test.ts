// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  THEME_STORAGE_KEY,
  applyThemeToDocument,
  persistThemePreference,
  resolveThemePreference,
  syncNativeWindowTheme,
} from "../theme/theme";

describe("theme", () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns stored light preference over system preference", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    expect(resolveThemePreference()).toBe("light");
  });

  it("returns dark when system prefers dark and no stored preference", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    expect(resolveThemePreference()).toBe("dark");
  });

  it("applies theme to the document root", () => {
    applyThemeToDocument("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("persists theme preference to localStorage", () => {
    persistThemePreference("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("returns light when system prefers light and no stored preference", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    expect(resolveThemePreference()).toBe("light");
  });

  it("syncs the native window theme when the preload bridge is available", () => {
    window.api = {
      theme: {
        set: vi.fn(),
      },
    } as unknown as typeof window.api;

    syncNativeWindowTheme("dark");
    expect(window.api?.theme?.set).toHaveBeenCalledWith("dark");
  });
});
