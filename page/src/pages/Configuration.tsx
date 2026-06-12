import CopyButton from "../components/CopyButton";
import PageMeta from "../components/PageMeta";
import {
  CONFIG_STRUCTURE_EXAMPLE,
  INTERPOLATION_EXAMPLE,
  PROFILE_BLOCK_EXAMPLE,
} from "../data/exampleWorkflows";
import { siteLinks } from "../constants/siteLinks";
import { useTranslation } from "../i18n";

const ConfigurationPage = () => {
  const { t } = useTranslation();

  return (
    <div className="page-content">
      <PageMeta title={t.nav.configuration} description={t.configuration.subtitle} />

      <section className="section-header">
        <h1>{t.configuration.title}</h1>
        <p>{t.configuration.subtitle}</p>
      </section>

      <section className="docs-section">
        <h2>{t.configuration.configTitle}</h2>
        <p>{t.configuration.configBody}</p>
        <div className="code-block-row">
          <pre className="code-block">
            <code>{CONFIG_STRUCTURE_EXAMPLE}</code>
          </pre>
          <CopyButton value={CONFIG_STRUCTURE_EXAMPLE} label="config structure" />
        </div>
      </section>

      <section className="docs-section">
        <h2>{t.configuration.interpolationTitle}</h2>
        <p>{t.configuration.interpolationBody}</p>
        <div className="code-block-row">
          <pre className="code-block">
            <code>{INTERPOLATION_EXAMPLE}</code>
          </pre>
          <CopyButton value={INTERPOLATION_EXAMPLE} label="interpolation example" />
        </div>
      </section>

      <section className="docs-section">
        <h2>{t.configuration.profilesTitle}</h2>
        <p>{t.configuration.profilesBody}</p>
      </section>

      <section className="docs-section">
        <h2>{t.configuration.cliTitle}</h2>
        <div className="props-table-wrapper">
          <table className="props-table">
            <thead>
              <tr>
                <th>{t.common.param}</th>
                <th>{t.common.required}</th>
                <th>{t.common.description}</th>
              </tr>
            </thead>
            <tbody>
              {t.configuration.cliRows.map((row) => (
                <tr key={row.param}>
                  <td>
                    <code>{row.param}</code>
                  </td>
                  <td>{row.required}</td>
                  <td>{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="docs-section">
        <h2>{t.configuration.profileBlockTitle}</h2>
        <p>{t.configuration.profileBlockBody}</p>
        <div className="code-block-row">
          <pre className="code-block">
            <code>{PROFILE_BLOCK_EXAMPLE}</code>
          </pre>
          <CopyButton value={PROFILE_BLOCK_EXAMPLE} label="profile block" />
        </div>
      </section>

      <section className="docs-section">
        <h2>{t.configuration.scheduledTitle}</h2>
        <p>{t.configuration.scheduledBody}</p>
      </section>

      <section className="docs-section">
        <h2>{t.configuration.devTitle}</h2>
        <p>{t.configuration.devBody}</p>
        <p>
          <a href={siteLinks.githubRepo} target="_blank" rel="noreferrer">
            {t.common.viewOnGitHub}
          </a>
        </p>
      </section>
    </div>
  );
};

export default ConfigurationPage;
