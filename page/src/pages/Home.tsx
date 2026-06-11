import { Link } from "react-router-dom";

import CopyButton from "../components/CopyButton";
import DownloadButton from "../components/DownloadButton";
import ExternalLinks from "../components/ExternalLinks";
import PageMeta from "../components/PageMeta";
import ScreenshotFigure from "../components/ScreenshotFigure";
import { EXAMPLE_WORKFLOWS } from "../data/exampleWorkflows";
import { siteLinks } from "../constants/siteLinks";
import { siteMeta } from "../constants/siteMeta";
import { useTranslation } from "../i18n";

const HomePage = () => {
  const { t } = useTranslation();

  const valueProps = [
    t.home.valueProp1,
    t.home.valueProp2,
    t.home.valueProp3,
    t.home.valueProp4,
    t.home.valueProp5,
  ];

  return (
    <div className="page-content">
      <PageMeta title={t.nav.home} description={t.meta.siteDescription} />

      <section className="hero-section">
        <p className="hero-tag">{t.home.tag}</p>
        <h1>{t.home.title}</h1>
        <p>{t.home.subtitle}</p>
        <p className="hero-stats">
          v{siteMeta.version} · {t.meta.windowsOnlyNote}
        </p>
        <DownloadButton variant="hero" />
        <ExternalLinks />
        <div className="hero-actions">
          <Link to="/action-steps" className="primary-button">
            {t.common.browseActionSteps}
          </Link>
          <Link to="/getting-started" className="secondary-button">
            {t.common.gettingStarted}
          </Link>
          <a href={siteLinks.githubRepo} target="_blank" rel="noreferrer" className="secondary-button">
            {t.common.viewOnGitHub}
          </a>
        </div>
      </section>

      <ScreenshotFigure
        src="/screenshots/app-overview.png"
        alt="ShellForge desktop app overview"
        caption={t.home.versionBadge}
      />

      <section className="value-props-section">
        <h2>{t.home.valuePropsTitle}</h2>
        <ul className="value-props-list">
          {valueProps.map((valueProp) => (
            <li key={valueProp}>{valueProp}</li>
          ))}
        </ul>
      </section>

      <section className="examples-grid">
        {EXAMPLE_WORKFLOWS.map((workflow) => (
          <article className="example-card" key={workflow.id}>
            <h2>{t.home[workflow.titleKey]}</h2>
            <div className="code-block-row">
              <pre className="code-block">
                <code>{workflow.json}</code>
              </pre>
              <CopyButton value={workflow.json} label={workflow.id} />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default HomePage;
