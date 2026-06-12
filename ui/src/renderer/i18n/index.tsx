import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  getDictionary,
  persistLocale,
  readStoredLocale,
  type AppTranslationDictionary,
  type Locale,
} from "../../shared/i18n";

interface I18nContextValue {
  locale: Locale;
  setLocale: (nextLocale: Locale) => void;
  t: AppTranslationDictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps): JSX.Element {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale());

  const applyLocale = useCallback((nextLocale: Locale): void => {
    setLocaleState(nextLocale);
    persistLocale(nextLocale);
    document.documentElement.lang = nextLocale === "pt-BR" ? "pt-BR" : "en";
  }, []);

  const setLocale = useCallback(
    (nextLocale: Locale): void => {
      applyLocale(nextLocale);
      void window.api?.locale?.sync(nextLocale);
    },
    [applyLocale],
  );

  useEffect(() => {
    applyLocale(readStoredLocale());
    void window.api?.locale?.sync(readStoredLocale());
  }, [applyLocale]);

  useEffect(() => {
    if (!window.api?.locale?.onChanged) {
      return;
    }

    return window.api.locale.onChanged((nextLocale) => {
      applyLocale(nextLocale);
    });
  }, [applyLocale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: getDictionary(locale),
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within I18nProvider");
  }
  return context;
}

export function readInitialLocale(): Locale {
  return readStoredLocale() ?? DEFAULT_LOCALE;
}
