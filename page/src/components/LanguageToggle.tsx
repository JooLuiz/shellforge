import { useTranslation, type Locale } from "../i18n";

const LanguageToggle = () => {
  const { locale, setLocale } = useTranslation();

  const handleChange = (nextLocale: Locale) => {
    setLocale(nextLocale);
  };

  return (
    <div className="language-toggle-row">
      <span className="language-toggle-label">Language</span>
      <div className="language-toggle-buttons">
        <button
          type="button"
          className={locale === "en" ? "language-pill language-pill-active" : "language-pill"}
          onClick={() => handleChange("en")}
        >
          EN
        </button>
        <button
          type="button"
          className={locale === "pt-BR" ? "language-pill language-pill-active" : "language-pill"}
          onClick={() => handleChange("pt-BR")}
        >
          PT
        </button>
      </div>
    </div>
  );
};

export default LanguageToggle;
