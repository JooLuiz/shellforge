import type { ThemeMode } from "../../shared/themeBridge";

export type { ThemeMode };

export const THEME_STORAGE_KEY = "shell-forge-theme";

export function resolveThemePreference(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyThemeToDocument(theme: ThemeMode): void {
  document.documentElement.dataset.theme = theme;
}

export function persistThemePreference(theme: ThemeMode): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function syncNativeWindowTheme(theme: ThemeMode): void {
  if (typeof window === "undefined" || !window.api?.theme) {
    return;
  }

  void window.api.theme.set(theme);
}
