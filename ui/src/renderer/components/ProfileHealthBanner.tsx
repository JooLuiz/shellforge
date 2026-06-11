import type { ProfileIssue, ProfileStatus } from "../../shared/types";

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
  if (profileStatus.isHealthy) {
    return null;
  }

  const showRegenerateAction = canRegenerateProfileBlock(profileStatus.issues);

  return (
    <div className="profile-health-banner warning-box" role="status">
      <strong>PowerShell profile needs attention</strong>
      {profileStatus.profilePath ? (
        <p className="profile-health-banner-path">
          Profile path: <code>{profileStatus.profilePath}</code>
        </p>
      ) : null}
      <ul className="profile-health-banner-issues">
        {profileStatus.issues.map((issue) => (
          <li key={issue.code}>
            <span>{issue.message}</span>
            <span className="profile-health-banner-remediation">{issue.remediation}</span>
          </li>
        ))}
      </ul>
      <div className="profile-health-banner-actions">
        {showRegenerateAction ? (
          <button
            type="button"
            className="button button-teal"
            disabled={isSaving}
            onClick={() => void onRegenerate()}
          >
            Regenerate profile block
          </button>
        ) : null}
        {profileStatus.profilePath ? (
          <button
            type="button"
            className="button button-blue"
            onClick={() => void onOpenFolder()}
          >
            Open profile folder
          </button>
        ) : null}
      </div>
    </div>
  );
}
