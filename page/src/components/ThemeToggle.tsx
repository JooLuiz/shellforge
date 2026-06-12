import PrettyIcons from "js-pretty-icons";

const THEME_TOGGLE_ICON_SIZE = 18;

export type PageTheme = "dark" | "light";

type ThemeToggleProps = {
  setTheme: (nextTheme: PageTheme) => void;
  theme: PageTheme;
};

const ThemeToggle = ({ setTheme, theme }: ThemeToggleProps) => {
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
};

export default ThemeToggle;
