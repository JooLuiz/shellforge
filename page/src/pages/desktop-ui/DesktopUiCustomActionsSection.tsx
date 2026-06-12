import ScreenshotFigure from "../../components/ScreenshotFigure";
import { useTranslation } from "../../i18n";

const DesktopUiCustomActionsSection = () => {
  const { t } = useTranslation();

  return (
    <section className="docs-section">
      <h2>{t.desktopUi.customTitle}</h2>
      <p>{t.desktopUi.customBody}</p>
      <ScreenshotFigure src="/screenshots/custom-actions-list.png" alt="Custom Actions list" />
      <ScreenshotFigure
        src="/screenshots/custom-actions-flow-editor.png"
        alt="Custom Actions flow editor"
      />
      <ScreenshotFigure
        src="/screenshots/custom-actions-step-details.png"
        alt="Custom Actions step details"
      />
    </section>
  );
};

export default DesktopUiCustomActionsSection;
