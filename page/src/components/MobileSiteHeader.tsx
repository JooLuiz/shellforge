import { Link } from "react-router-dom";

import { siteMeta } from "../constants/siteMeta";
import { useTranslation } from "../i18n";
import ThemeToggle, { type PageTheme } from "./ThemeToggle";

type MobileSiteHeaderProps = {
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  setTheme: (nextTheme: PageTheme) => void;
  theme: PageTheme;
};

const MobileSiteHeader = ({
  isMenuOpen,
  onToggleMenu,
  setTheme,
  theme,
}: MobileSiteHeaderProps) => {
  const { t } = useTranslation();

  return (
    <header className="mobile-site-header">
      <Link to="/" className="site-brand mobile-site-brand">
        <img src="/shell-forge-mark.svg" alt="" className="site-brand-icon" width={24} height={24} />
        <span>{siteMeta.productName}</span>
      </Link>
      <div className="mobile-site-header-actions">
        <ThemeToggle theme={theme} setTheme={setTheme} />
        <button
          type="button"
          className="mobile-menu-button"
          onClick={onToggleMenu}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={isMenuOpen ? t.common.closeMenu : t.common.openMenu}
        >
          <span className="mobile-menu-button-bar" />
          <span className="mobile-menu-button-bar" />
          <span className="mobile-menu-button-bar" />
        </button>
      </div>
    </header>
  );
};

export default MobileSiteHeader;
