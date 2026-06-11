import ScreenshotFigure from "../../components/ScreenshotFigure";
import { useTranslation } from "../../i18n";

const DesktopUiPredefinedSection = () => {
  const { t } = useTranslation();

  return (
    <section className="docs-section">
      <h2>{t.desktopUi.predefinedTitle}</h2>
      <p>{t.desktopUi.predefinedBody}</p>
      <ScreenshotFigure
        src="/screenshots/predefined-commands-tab.png"
        alt="Pre-defined Commands tab"
      />
    </section>
  );
};

export default DesktopUiPredefinedSection;
