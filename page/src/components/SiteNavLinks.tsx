import { NavLink } from "react-router-dom";

import { useTranslation } from "../i18n";

type SiteNavLinksProps = {
  className?: string;
  onNavigate?: () => void;
};

const SiteNavLinks = ({ className = "site-nav", onNavigate }: SiteNavLinksProps) => {
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
    <nav className={className}>
      {navItems.map((navItem) => (
        <NavLink
          key={navItem.to}
          to={navItem.to}
          end={navItem.end}
          className={({ isActive }) => (isActive ? "nav-link nav-link-active" : "nav-link")}
          onClick={onNavigate}
        >
          {navItem.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default SiteNavLinks;
