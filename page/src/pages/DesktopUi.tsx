import PageMeta from "../components/PageMeta";
import DesktopUiCustomActionsSection from "./desktop-ui/DesktopUiCustomActionsSection";
import DesktopUiPredefinedSection from "./desktop-ui/DesktopUiPredefinedSection";
import DesktopUiScheduledSection from "./desktop-ui/DesktopUiScheduledSection";
import { useTranslation } from "../i18n";

const DesktopUiPage = () => {
  const { t } = useTranslation();

  return (
    <div className="page-content">
      <PageMeta title={t.nav.desktopUi} description={t.desktopUi.subtitle} />

      <section className="section-header">
        <h1>{t.desktopUi.title}</h1>
        <p>{t.desktopUi.subtitle}</p>
      </section>

      <section className="docs-section">
        <p>{t.desktopUi.intro}</p>
      </section>

      <DesktopUiPredefinedSection />
      <DesktopUiCustomActionsSection />
      <DesktopUiScheduledSection />
    </div>
  );
};

export default DesktopUiPage;
