import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";

import DownloadButton from "./DownloadButton";
import ExternalLinks from "./ExternalLinks";
import Footer from "./Footer";
import LanguageToggle from "./LanguageToggle";
import { siteMeta } from "../constants/siteMeta";
import { useTranslation } from "../i18n";

type LayoutProps = {
  children: ReactNode;
  theme: "dark" | "light";
  onToggleTheme: () => void;
};

const Layout = ({ children, theme, onToggleTheme }: LayoutProps) => {
  const { t } = useTranslation();

  const navItems = [
    { to: "/", label: t.nav.home, end: true },
    { to: "/getting-started", label: t.nav.gettingStarted, end: true },
    { to: "/desktop-ui", label: t.nav.desktopUi, end: true },
    { to: "/action-steps", label: t.nav.actionSteps, end: true },
    { to: "/predefined-commands", label: t.nav.predefinedCommands, end: true },
    { to: "/configuration", label: t.nav.configuration, end: true },
  ];

  return (
    <div className="site-shell">
      <aside className="site-sidebar">
        <Link to="/" className="site-brand">
          <img src="/shell-forge-mark.svg" alt="" className="site-brand-icon" width={28} height={28} />
          {siteMeta.productName}
        </Link>
        <p className="site-description">{t.meta.siteDescription}</p>
        <ExternalLinks variant="compact" />
        <nav className="site-nav">
          {navItems.map((navItem) => (
            <NavLink
              key={navItem.to}
              to={navItem.to}
              end={navItem.end}
              className={({ isActive }) => (isActive ? "nav-link nav-link-active" : "nav-link")}
            >
              {navItem.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <DownloadButton variant="sidebar" />
          <LanguageToggle />
          <div className="theme-switch-row">
            <span className={`theme-icon ${theme === "dark" ? "theme-icon-active" : ""}`} aria-hidden="true">
              🌙
            </span>
            <button
              type="button"
              className={`theme-switch ${theme === "light" ? "theme-switch-light" : ""}`}
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <span className="theme-switch-thumb" />
            </button>
            <span className={`theme-icon ${theme === "light" ? "theme-icon-active" : ""}`} aria-hidden="true">
              ☀️
            </span>
          </div>
          <Footer />
        </div>
      </aside>
      <main className="site-main">{children}</main>
    </div>
  );
};

export default Layout;
