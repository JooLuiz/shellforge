import StepReferenceCard from "../../components/StepReferenceCard";
import { STEP_DEFINITIONS_BY_CATEGORY } from "../../data/stepDefinitions";
import { getCategoryLabel, useTranslation } from "../../i18n";
import type { StepCategory } from "../../i18n/types";

const CATEGORY_ORDER: StepCategory[] = ["browser", "timing", "data", "controlFlow"];

const ActionStepsList = () => {
  const { t } = useTranslation();

  return (
    <>
      <nav className="category-filter-panel" aria-label="Step categories">
        {CATEGORY_ORDER.map((category) => (
          <a key={category} href={`#category-${category}`} className="category-pill">
            {getCategoryLabel(category, t)}
          </a>
        ))}
      </nav>

      {CATEGORY_ORDER.map((category) => (
        <section className="docs-section" key={category} id={`category-${category}`}>
          <h2>{getCategoryLabel(category, t)}</h2>
          <div className="step-reference-list">
            {STEP_DEFINITIONS_BY_CATEGORY[category].map((step) => (
              <StepReferenceCard key={step.action} step={step} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
};

export default ActionStepsList;
