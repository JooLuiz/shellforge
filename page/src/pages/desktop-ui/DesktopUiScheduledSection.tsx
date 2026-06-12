import ScreenshotFigure from "../../components/ScreenshotFigure";
import { useTranslation } from "../../i18n";

const DesktopUiScheduledSection = () => {
  const { t } = useTranslation();

  return (
    <section className="docs-section">
      <h2>{t.desktopUi.scheduledTitle}</h2>
      <p>{t.desktopUi.scheduledBody}</p>
      <ScreenshotFigure src="/screenshots/scheduled-tasks-tab.png" alt="Scheduled Tasks tab" />
      <ScreenshotFigure src="/screenshots/scheduled-task-modal.png" alt="Scheduled task modal" />
      <p>{t.desktopUi.footerNote}</p>
    </section>
  );
};

export default DesktopUiScheduledSection;
