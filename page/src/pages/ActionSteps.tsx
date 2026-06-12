import CopyButton from "../components/CopyButton";
import PageMeta from "../components/PageMeta";
import { COMPOSED_WORKFLOW_EXAMPLES } from "../data/exampleWorkflows";
import ActionStepsIntro from "./action-steps/ActionStepsIntro";
import ActionStepsList from "./action-steps/ActionStepsList";
import { useTranslation } from "../i18n";

const ActionStepsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="page-content">
      <PageMeta title={t.nav.actionSteps} description={t.actionSteps.subtitle} />

      <ActionStepsIntro />
      <ActionStepsList />

      <section className="docs-section">
        <h2>{t.actionSteps.workflowsTitle}</h2>
        {COMPOSED_WORKFLOW_EXAMPLES.map((workflow) => (
          <article className="example-card" key={workflow.id}>
            <h3>{workflow.title}</h3>
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

export default ActionStepsPage;
