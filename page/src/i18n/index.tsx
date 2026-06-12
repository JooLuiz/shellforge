import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { en } from "./en";
import { ptBR } from "./pt-BR";
import type { Locale, TranslationDictionary } from "./types";

const LOCALE_STORAGE_KEY = "shellforge-page-locale";

const dictionaries: Record<Locale, TranslationDictionary> = {
  en,
  "pt-BR": ptBR,
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationDictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") {
    return "en";
  }

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === "en" || stored === "pt-BR") {
    return stored;
  }

  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
  };

  useEffect(() => {
    document.documentElement.lang = locale === "pt-BR" ? "pt-BR" : "en";
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: dictionaries[locale],
    }),
    [locale],
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

export function getCategoryLabel(
  category: "browser" | "timing" | "data" | "controlFlow",
  t: TranslationDictionary,
): string {
  switch (category) {
    case "browser":
      return t.common.categoryBrowser;
    case "timing":
      return t.common.categoryTiming;
    case "data":
      return t.common.categoryData;
    case "controlFlow":
      return t.common.categoryControlFlow;
  }
}

export type { Locale, TranslationDictionary } from "./types";
