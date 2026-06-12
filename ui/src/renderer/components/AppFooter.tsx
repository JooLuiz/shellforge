import PrettyIcons from "js-pretty-icons";
import type { ThemeMode } from "../theme/theme";
import { ThemeToggle } from "./ThemeToggle";

const FOOTER_ICON_SIZE = 24;

interface AppFooterProps {
  setTheme: (nextTheme: ThemeMode) => void;
  theme: ThemeMode;
}

export function AppFooter({ setTheme, theme }: AppFooterProps) {
  return (
    <footer className="app-footer">
      <span>
        © 2024–2026 ShellForge. All rights reserved. Developed by Joao Luiz
        de Castro (
        <a
          href="https://github.com/JooLuiz"
          target="_blank"
          rel="noreferrer"
          className="footer-developer-link"
        >
          @JooLuiz
        </a>
        )
      </span>
      <div className="footer-links">
        <ThemeToggle setTheme={setTheme} theme={theme} />
        <a
          href="https://shellforge.app.br"
          target="_blank"
          rel="noreferrer"
          aria-label="ShellForge website"
        >
          <PrettyIcons
            icon="chrome"
            width={FOOTER_ICON_SIZE}
            height={FOOTER_ICON_SIZE}
            color="currentColor"
          />
        </a>
        <a
          href="https://github.com/JooLuiz/shellforge"
          target="_blank"
          rel="noreferrer"
          aria-label="ShellForge GitHub repository"
        >
          <PrettyIcons
            icon="github"
            width={FOOTER_ICON_SIZE}
            height={FOOTER_ICON_SIZE}
            color="currentColor"
          />
        </a>
      </div>
    </footer>
  );
}
