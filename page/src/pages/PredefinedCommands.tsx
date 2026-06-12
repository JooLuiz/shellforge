import CommandCatalogCard from "../components/CommandCatalogCard";
import PageMeta from "../components/PageMeta";
import {
  PREDEFINED_CATEGORY_ORDER,
  PREDEFINED_COMMANDS,
  type PredefinedCommandCategory,
} from "../data/predefinedCommands";
import { useTranslation } from "../i18n";

function getCategoryLabel(
  category: PredefinedCommandCategory,
  categories: ReturnType<typeof useTranslation>["t"]["categories"],
): string {
  switch (category) {
    case "core":
      return categories.core;
    case "shell-lifecycle":
      return categories.shellLifecycle;
    case "unix-parity":
      return categories.unixParity;
    case "windows-utilities":
      return categories.windowsUtilities;
  }
}

const PredefinedCommandsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="page-content">
      <PageMeta title={t.nav.predefinedCommands} description={t.predefined.subtitle} />

      <section className="section-header">
        <h1>{t.predefined.title}</h1>
        <p>{t.predefined.subtitle}</p>
      </section>

      {PREDEFINED_CATEGORY_ORDER.map((category) => {
        const commands = PREDEFINED_COMMANDS.filter((command) => command.category === category);
        const categoryLabel = getCategoryLabel(category, t.categories);

        return (
          <section className="docs-section" key={category}>
            <h2>{categoryLabel}</h2>
            <div className="command-catalog-grid">
              {commands.map((command) => (
                <CommandCatalogCard key={command.key} commandKey={command.key} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default PredefinedCommandsPage;
