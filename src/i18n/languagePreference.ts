import { fallbackLanguage, supportedLanguages, type SupportedLanguage } from "./index";

export interface LanguagePreferenceStore {
  read(): string | null;
  write(language: SupportedLanguage): void;
}

export function parseSupportedLanguage(
  language: string | null | undefined,
): SupportedLanguage | null {
  if (!language) {
    return null;
  }

  const normalizedLanguage = language.toLowerCase().split("-")[0];
  return (
    supportedLanguages.find((supportedLanguage) => supportedLanguage === normalizedLanguage) ?? null
  );
}

export function resolveInitialLanguage(
  storedLanguage: string | null,
  browserLanguages: readonly string[],
): SupportedLanguage {
  const persistedLanguage = parseSupportedLanguage(storedLanguage);

  if (persistedLanguage) {
    return persistedLanguage;
  }

  for (const browserLanguage of browserLanguages) {
    const supportedLanguage = parseSupportedLanguage(browserLanguage);

    if (supportedLanguage) {
      return supportedLanguage;
    }
  }

  return fallbackLanguage;
}
