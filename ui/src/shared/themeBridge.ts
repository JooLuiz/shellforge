export type ThemeMode = "light" | "dark";

export type NativeThemeSource = "light" | "dark";

export const WINDOW_BACKGROUND_BY_THEME: Record<ThemeMode, string> = {
  light: "#f4f5f7",
  dark: "#1c2230",
};

export const DEFAULT_WINDOW_BACKGROUND = WINDOW_BACKGROUND_BY_THEME.light;

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark";
}

export function toNativeThemeSource(theme: ThemeMode): NativeThemeSource {
  return theme;
}

export function getWindowBackgroundColor(theme: ThemeMode): string {
  return WINDOW_BACKGROUND_BY_THEME[theme];
}
