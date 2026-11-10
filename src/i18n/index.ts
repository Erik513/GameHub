import { createInstance, type InitOptions, type i18n } from "i18next";
import { initReactI18next } from "react-i18next";
import type { GameHubLanguage } from "../business/settings/languageSettings";
import { common as germanCommon } from "./resources/de/common";
import { common as englishCommon } from "./resources/en/common";

export const supportedLanguages = ["de", "en"] as const;
export type SupportedLanguage = GameHubLanguage;

export const defaultNamespace = "common" as const;
export const fallbackLanguage: SupportedLanguage = "en";

export const resources = {
  de: { common: germanCommon },
  en: { common: englishCommon },
} as const;

const baseOptions = {
  resources,
  defaultNS: defaultNamespace,
  fallbackNS: defaultNamespace,
  fallbackLng: fallbackLanguage,
  supportedLngs: supportedLanguages,
  interpolation: {
    escapeValue: false,
  },
  initAsync: false,
} satisfies InitOptions;

export async function createGameHubI18n(
  language: SupportedLanguage = fallbackLanguage,
): Promise<i18n> {
  const instance = createInstance();
  await instance.use(initReactI18next).init({ ...baseOptions, lng: language });
  return instance;
}

export const gameHubI18n = createInstance();
void gameHubI18n.use(initReactI18next).init({ ...baseOptions, lng: fallbackLanguage });
