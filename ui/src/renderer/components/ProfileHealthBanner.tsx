import type { ProfileIssue, ProfileStatus } from "../../shared/types";
import { useTranslation } from "../i18n";

interface ProfileHealthBannerProps {
  profileStatus: ProfileStatus;
  isSaving: boolean;
  onRegenerate: () => Promise<void>;
  onOpenFolder: () => Promise<void>;
}

function canRegenerateProfileBlock(issues: ProfileIssue[]): boolean {
  return !issues.some((issue) =>
    issue.code === "profilePathUnresolved" ||
    issue.code === "profileDirectoryNotWritable" ||
    issue.code === "profileFileNotWritable",
  );
}

export function ProfileHealthBanner({
  profileStatus,
  isSaving,
  onRegenerate,
  onOpenFolder,
}: ProfileHealthBannerProps): JSX.Element | null {
  const { t } = useTranslation();

  if (profileStatus.isHealthy) {
    return null;
  }

  const showRegenerateAction = canRegenerateProfileBlock(profileStatus.issues);

  return (
    <div className="profile-health-banner warning-box" role="status">
      <strong>{t.profileHealth.title}</strong>
      {profileStatus.profilePath ? (
        <p className="profile-health-banner-path">
          {t.profileHealth.profilePathLabel}{" "}
          <code>{profileStatus.profilePath}</code>
        </p>
      ) : null}
      <ul className="profile-health-banner-issues">
        {profileStatus.issues.map((issue) => {
          const translatedIssue = t.profileHealth.issues[issue.code];
          return (
            <li key={issue.code}>
              <span>{translatedIssue?.message ?? issue.message}</span>
              <span className="profile-health-banner-remediation">
                {translatedIssue?.remediation ?? issue.remediation}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="profile-health-banner-actions">
        {showRegenerateAction ? (
          <button
            type="button"
            className="button button-teal"
            disabled={isSaving}
            onClick={() => void onRegenerate()}
          >
            {t.profileHealth.regenerateProfileBlock}
          </button>
        ) : null}
        {profileStatus.profilePath ? (
          <button
            type="button"
            className="button button-blue"
            onClick={() => void onOpenFolder()}
          >
            {t.profileHealth.openProfileFolder}
          </button>
        ) : null}
      </div>
    </div>
  );
}
