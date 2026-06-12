import { useTranslation } from "../i18n";

type CommandCatalogCardProps = {
  commandKey: string;
};

const CommandCatalogCard = ({ commandKey }: CommandCatalogCardProps) => {
  const { t } = useTranslation();
  const commandCopy = t.commands[commandKey];

  if (!commandCopy) {
    return null;
  }

  return (
    <article className="example-card command-catalog-card">
      <h3>
        <code>{commandKey}</code>
      </h3>
      <p>{commandCopy.description}</p>
      <p className="command-usage-label">{t.predefined.usageLabel}</p>
      <pre className="code-block">
        <code>{commandCopy.usage}</code>
      </pre>
    </article>
  );
};

export default CommandCatalogCard;
