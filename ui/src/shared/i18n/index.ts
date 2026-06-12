import { enDictionary } from "./en";
import { ptBrDictionary } from "./pt-BR";
import type { AppTranslationDictionary, Locale } from "./types";

export type {
  AppTranslationDictionary,
  DeleteConfirmVariant,
  Locale,
  ProfileIssueTranslation,
} from "./types";

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "shell-forge-locale";

const dictionaries: Record<Locale, AppTranslationDictionary> = {
  en: enDictionary,
  "pt-BR": ptBrDictionary,
};

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "pt-BR";
}

export function getDictionary(locale: Locale): AppTranslationDictionary {
  return dictionaries[locale];
}

export function readStoredLocale(): Locale {
  if (typeof localStorage === "undefined") {
    return DEFAULT_LOCALE;
  }

  const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
  return isLocale(storedLocale) ? storedLocale : DEFAULT_LOCALE;
}

export function persistLocale(locale: Locale): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export function formatMessage(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce((formattedMessage, [key, value]) => {
    return formattedMessage.replaceAll(`{${key}}`, value);
  }, template);
}
