import { useEffect } from "react";

import DownloadButton from "./DownloadButton";
import ExternalLinks from "./ExternalLinks";
import Footer from "./Footer";
import LanguageToggle from "./LanguageToggle";
import SiteNavLinks from "./SiteNavLinks";
import { useTranslation } from "../i18n";

type MobileNavDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const MobileNavDrawer = ({ isOpen, onClose }: MobileNavDrawerProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="mobile-nav-overlay" onClick={onClose}>
      <aside
        id="mobile-nav-drawer"
        className="mobile-nav-drawer"
        onClick={(event) => event.stopPropagation()}
        aria-label={t.common.openMenu}
      >
        <p className="site-description">{t.meta.siteDescription}</p>
        <ExternalLinks variant="compact" />
        <SiteNavLinks onNavigate={onClose} />
        <div className="mobile-nav-drawer-bottom">
          <DownloadButton variant="sidebar" />
          <LanguageToggle />
          <Footer />
        </div>
      </aside>
    </div>
  );
};

export default MobileNavDrawer;
