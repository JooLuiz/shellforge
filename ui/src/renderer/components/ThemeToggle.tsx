import PrettyIcons from "js-pretty-icons";
import type { ThemeMode } from "../theme/theme";

const THEME_TOGGLE_ICON_SIZE = 18;

interface ThemeToggleProps {
  setTheme: (nextTheme: ThemeMode) => void;
  theme: ThemeMode;
}

export function ThemeToggle({ setTheme, theme }: ThemeToggleProps): JSX.Element {
  const isLight = theme === "light";
  const isDark = theme === "dark";

  return (
    <div className="theme-toggle" role="group" aria-label="Color theme">
      <button
        type="button"
        className={
          isLight
            ? "theme-toggle-option theme-toggle-option--active"
            : "theme-toggle-option"
        }
        aria-label="Light mode"
        aria-pressed={isLight}
        onClick={() => setTheme("light")}
      >
        <PrettyIcons
          icon="sun"
          width={THEME_TOGGLE_ICON_SIZE}
          height={THEME_TOGGLE_ICON_SIZE}
          color="currentColor"
        />
      </button>
      <button
        type="button"
        className={
          isDark
            ? "theme-toggle-option theme-toggle-option--active"
            : "theme-toggle-option"
        }
        aria-label="Dark mode"
        aria-pressed={isDark}
        onClick={() => setTheme("dark")}
      >
        <PrettyIcons
          icon="moon"
          width={THEME_TOGGLE_ICON_SIZE}
          height={THEME_TOGGLE_ICON_SIZE}
          color="currentColor"
        />
      </button>
    </div>
  );
}
