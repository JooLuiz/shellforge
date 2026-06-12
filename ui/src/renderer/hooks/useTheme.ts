import { useCallback, useState } from "react";
import {
  applyThemeToDocument,
  persistThemePreference,
  resolveThemePreference,
  syncNativeWindowTheme,
  type ThemeMode,
} from "../theme/theme";

export function applyInitialTheme(): ThemeMode {
  const theme = resolveThemePreference();
  applyThemeToDocument(theme);
  syncNativeWindowTheme(theme);
  return theme;
}

interface UseThemeResult {
  isDark: boolean;
  isLight: boolean;
  setTheme: (nextTheme: ThemeMode) => void;
  theme: ThemeMode;
}

export function useTheme(): UseThemeResult {
  const [theme, setThemeState] = useState<ThemeMode>(() => resolveThemePreference());

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    persistThemePreference(nextTheme);
    applyThemeToDocument(nextTheme);
    syncNativeWindowTheme(nextTheme);
    setThemeState(nextTheme);
  }, []);

  return {
    theme,
    setTheme,
    isLight: theme === "light",
    isDark: theme === "dark",
  };
}
