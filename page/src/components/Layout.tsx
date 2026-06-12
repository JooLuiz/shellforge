import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

import DownloadButton from "./DownloadButton";
import ExternalLinks from "./ExternalLinks";
import Footer from "./Footer";
import LanguageToggle from "./LanguageToggle";
import MobileNavDrawer from "./MobileNavDrawer";
import MobileSiteHeader from "./MobileSiteHeader";
import SiteNavLinks from "./SiteNavLinks";
import ThemeToggle, { type PageTheme } from "./ThemeToggle";
import { siteMeta } from "../constants/siteMeta";
import { useTranslation } from "../i18n";

type LayoutProps = {
  children: ReactNode;
  setTheme: (nextTheme: PageTheme) => void;
  theme: PageTheme;
};

const Layout = ({ children, setTheme, theme }: LayoutProps) => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="site-shell">
      <aside className="site-sidebar">
        <Link to="/" className="site-brand">
          <img src="/shell-forge-mark.svg" alt="" className="site-brand-icon" width={28} height={28} />
          {siteMeta.productName}
        </Link>
        <p className="site-description">{t.meta.siteDescription}</p>
        <ExternalLinks variant="compact" />
        <SiteNavLinks />
        <div className="sidebar-bottom">
          <DownloadButton variant="sidebar" />
          <LanguageToggle />
          <div className="sidebar-theme-row">
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
          <Footer />
        </div>
      </aside>

      <MobileSiteHeader
        theme={theme}
        setTheme={setTheme}
        isMenuOpen={isMobileMenuOpen}
        onToggleMenu={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
      />
      <MobileNavDrawer isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />

      <main className="site-main">{children}</main>
    </div>
  );
};

export default Layout;
