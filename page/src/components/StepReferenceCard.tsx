import CopyButton from "./CopyButton";
import type { StepDocEntry } from "../data/stepDefinitions";
import { useTranslation } from "../i18n";

type StepReferenceCardProps = {
  step: StepDocEntry;
};

function formatRequiredLabel(
  required: StepDocEntry["fields"][number]["required"],
  t: ReturnType<typeof useTranslation>["t"],
): string {
  switch (required) {
    case "yes":
      return t.common.yes;
    case "no":
      return t.common.no;
    case "conditional":
      return t.common.conditional;
    case "oneOf":
      return t.common.optional;
  }
}

const StepReferenceCard = ({ step }: StepReferenceCardProps) => {
  const { t } = useTranslation();
  const stepCopy = t.actionSteps.steps[step.action];
  const cardId = `step-${step.action}`;

  return (
    <article className="example-card step-reference-card" id={cardId}>
      <h3>
        <code>{step.action}</code>
      </h3>
      <p>{stepCopy?.summary ?? step.action}</p>
      {stepCopy?.notes ? <p className="step-notes">{stepCopy.notes}</p> : null}
      {step.nestedKeys && step.nestedKeys.length > 0 ? (
        <p className="step-nested-keys">
          Nested keys:{" "}
          {step.nestedKeys.map((key) => (
            <code key={key}>{key}</code>
          ))}
        </p>
      ) : null}
      {step.fields.length > 0 ? (
        <div className="props-table-wrapper">
          <table className="props-table">
            <thead>
              <tr>
                <th>{t.common.param}</th>
                <th>{t.common.type}</th>
                <th>{t.common.required}</th>
                <th>{t.common.interpolation}</th>
                <th>{t.common.description}</th>
              </tr>
            </thead>
            <tbody>
              {step.fields.map((field) => (
                <tr key={field.key}>
                  <td>
                    <code>{field.key}</code>
                  </td>
                  <td>{field.type}</td>
                  <td>{formatRequiredLabel(field.required, t)}</td>
                  <td>{field.interpolation ? t.common.yes : t.common.no}</td>
                  <td>
                    {t.actionSteps.fieldHints[field.key] ?? field.key}
                    {field.example ? (
                      <>
                        {" "}
                        <span className="field-example">
                          ({t.common.example}: <code>{field.example}</code>)
                        </span>
                      </>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="step-no-fields">{t.common.optional}</p>
      )}
      <div className="code-block-row">
        <pre className="code-block">
          <code>{step.exampleJson}</code>
        </pre>
        <CopyButton value={step.exampleJson} label={`${step.action} example`} />
      </div>
    </article>
  );
};

export default StepReferenceCard;
