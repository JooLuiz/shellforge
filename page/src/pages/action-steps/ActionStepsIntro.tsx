import { useTranslation } from "../../i18n";

const ActionStepsIntro = () => {
  const { t } = useTranslation();

  return (
    <>
      <section className="section-header">
        <h1>{t.actionSteps.title}</h1>
        <p>{t.actionSteps.subtitle}</p>
      </section>

      <section className="docs-section">
        <p>{t.actionSteps.introInterpolation}</p>
        <p>{t.actionSteps.introNested}</p>
        <p>{t.actionSteps.introBrowserProfile}</p>
      </section>

      <section className="docs-section">
        <h2>{t.actionSteps.actionLevelTitle}</h2>
        <p>{t.actionSteps.actionLevelBody}</p>
      </section>
    </>
  );
};

export default ActionStepsIntro;
