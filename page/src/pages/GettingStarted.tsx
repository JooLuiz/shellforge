import CopyButton from "../components/CopyButton";
import DownloadButton from "../components/DownloadButton";
import PageMeta from "../components/PageMeta";
import { useTranslation } from "../i18n";

const CLI_EXAMPLE = "action-runner --action=perform-api-request -v";
const ARGS_EXAMPLE = 'action-runner --action=perform-api-request "--arg.message=Hello from CLI"';

const GettingStartedPage = () => {
  const { t } = useTranslation();

  return (
    <div className="page-content">
      <PageMeta title={t.nav.gettingStarted} description={t.gettingStarted.subtitle} />

      <section className="section-header">
        <h1>{t.gettingStarted.title}</h1>
        <p>{t.gettingStarted.subtitle}</p>
      </section>

      <DownloadButton variant="hero" />

      <section className="docs-section">
        <h2>{t.gettingStarted.requirementsTitle}</h2>
        <p>{t.gettingStarted.requirementsBody}</p>
      </section>

      <section className="docs-section">
        <h2>{t.gettingStarted.installTitle}</h2>
        <p>{t.gettingStarted.installBody}</p>
      </section>

      <section className="docs-section">
        <h2>{t.gettingStarted.installSizeTitle}</h2>
        <p>{t.gettingStarted.installSizeBody}</p>
      </section>

      <section className="docs-section">
        <h2>{t.gettingStarted.firstLaunchTitle}</h2>
        <p>{t.gettingStarted.firstLaunchBody}</p>
      </section>

      <section className="docs-section">
        <h2>{t.gettingStarted.enableCommandTitle}</h2>
        <p>{t.gettingStarted.enableCommandBody}</p>
      </section>

      <section className="docs-section">
        <h2>{t.gettingStarted.cliTitle}</h2>
        <p>{t.gettingStarted.cliBody}</p>
        <div className="code-block-row">
          <pre className="code-block">
            <code>{CLI_EXAMPLE}</code>
          </pre>
          <CopyButton value={CLI_EXAMPLE} label="cli example" />
        </div>
      </section>

      <section className="docs-section">
        <h2>{t.gettingStarted.argsTitle}</h2>
        <p>{t.gettingStarted.argsBody}</p>
        <div className="code-block-row">
          <pre className="code-block">
            <code>{ARGS_EXAMPLE}</code>
          </pre>
          <CopyButton value={ARGS_EXAMPLE} label="args example" />
        </div>
      </section>

      <section className="docs-section">
        <h2>{t.gettingStarted.filesTitle}</h2>
        <p>{t.gettingStarted.filesBody}</p>
      </section>

      <section className="docs-section">
        <h2>{t.gettingStarted.troubleshootingTitle}</h2>
        <ul className="value-props-list">
          {t.gettingStarted.troubleshootingItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default GettingStartedPage;
