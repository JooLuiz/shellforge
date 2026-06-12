import { siteLinks } from "../constants/siteLinks";
import { siteMeta } from "../constants/siteMeta";

type ExternalLinksProps = {
  variant?: "default" | "compact";
};

const ExternalLinks = ({ variant = "default" }: ExternalLinksProps) => {
  return (
    <div className={variant === "compact" ? "external-links external-links-compact" : "external-links"}>
      <a
        href={siteLinks.githubRepo}
        target="_blank"
        rel="noreferrer"
        className="external-link-badge"
      >
        GitHub v{siteMeta.version}
      </a>
      {variant === "default" && (
        <>
          <a href={siteLinks.issues} target="_blank" rel="noreferrer" className="external-link-badge">
            Issues
          </a>
          <a href={siteLinks.license} target="_blank" rel="noreferrer" className="external-link-badge">
            License
          </a>
        </>
      )}
    </div>
  );
};

export default ExternalLinks;
