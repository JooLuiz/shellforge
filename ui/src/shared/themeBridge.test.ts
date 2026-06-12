import { describe, expect, it } from "vitest";
import {
  DEFAULT_WINDOW_BACKGROUND,
  getWindowBackgroundColor,
  isThemeMode,
  toNativeThemeSource,
  WINDOW_BACKGROUND_BY_THEME,
} from "./themeBridge";

describe("themeBridge", () => {
  // Scenario: renderer and main process must agree on native theme source values.
  // Expected: light/dark app themes map directly to Electron nativeTheme sources.
  it("maps app theme modes to native theme sources", () => {
    expect(toNativeThemeSource("light")).toBe("light");
    expect(toNativeThemeSource("dark")).toBe("dark");
  });

  // Scenario: BrowserWindow background should match CSS surface colors.
  // Expected: known hex values are returned for each theme mode.
  it("returns window background colors for each theme", () => {
    expect(getWindowBackgroundColor("light")).toBe("#f4f5f7");
    expect(getWindowBackgroundColor("dark")).toBe("#1c2230");
    expect(DEFAULT_WINDOW_BACKGROUND).toBe(WINDOW_BACKGROUND_BY_THEME.light);
  });

  // Scenario: IPC handler must reject invalid theme payloads.
  // Expected: only light and dark are accepted as theme modes.
  it("validates theme mode values", () => {
    expect(isThemeMode("light")).toBe(true);
    expect(isThemeMode("dark")).toBe(true);
    expect(isThemeMode("system")).toBe(false);
    expect(isThemeMode(null)).toBe(false);
  });
});
