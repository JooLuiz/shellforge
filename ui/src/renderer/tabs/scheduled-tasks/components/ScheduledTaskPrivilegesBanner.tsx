import { useTranslation } from "../../../i18n";

interface ScheduledTaskPrivilegesBannerProps {
  isVisible: boolean;
}

export function ScheduledTaskPrivilegesBanner({
  isVisible,
}: ScheduledTaskPrivilegesBannerProps): JSX.Element | null {
  const { t } = useTranslation();

  if (!isVisible) {
    return null;
  }

  return (
    <div className="profile-health-banner warning-box" role="status">
      <strong>{t.scheduledTasks.privileges.title}</strong>
      <p>{t.scheduledTasks.privileges.message}</p>
      <p className="profile-health-banner-remediation">{t.scheduledTasks.privileges.remediation}</p>
    </div>
  );
}
