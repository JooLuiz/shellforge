import { siteMeta } from "../constants/siteMeta";
import { useTranslation } from "../i18n";

type DownloadButtonProps = {
  variant?: "hero" | "sidebar";
};

const DownloadButton = ({ variant = "hero" }: DownloadButtonProps) => {
  const { t } = useTranslation();
  const isAvailable = siteMeta.downloadAvailable;

  if (isAvailable) {
    return (
      <a
        href={siteMeta.downloadUrl}
        className={variant === "hero" ? "download-button download-button-hero" : "download-button download-button-sidebar"}
        target="_blank"
        rel="noreferrer"
      >
        <WindowsIcon />
        <span>{t.common.downloadWindows}</span>
      </a>
    );
  }

  return (
    <div className={variant === "hero" ? "download-button-wrap download-button-wrap-hero" : "download-button-wrap download-button-wrap-sidebar"}>
      <button type="button" className="download-button download-button-disabled" disabled aria-disabled="true">
        <WindowsIcon />
        <span>{t.common.downloadWindows}</span>
      </button>
      <span className="coming-soon-badge">{t.common.comingSoon}</span>
    </div>
  );
};

function WindowsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="download-button-icon">
      <path fill="currentColor" d="M3 5.5L10.5 4.2v7.6H3V5.5zm0 8.7h7.5v7.6L3 20.5v-6.3zm9.2-9.9L21 3v8.2h-8.8V4.3zm0 9.9H21V21l-8.8-1.5v-6.3z" />
    </svg>
  );
}

export default DownloadButton;
