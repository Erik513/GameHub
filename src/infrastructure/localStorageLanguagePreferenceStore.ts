import type { SupportedLanguage } from "../i18n";
import type { LanguagePreferenceStore } from "../i18n/languagePreference";

export const languagePreferenceStorageKey = "gamehub.uiLanguage";
export const cardLanguagePreferenceStorageKey = "gamehub.cardLanguage";

function createLocalStorageLanguageStore(
  storage: Storage,
  storageKey: string,
): LanguagePreferenceStore {
  return {
    read() {
      try {
        return storage.getItem(storageKey);
      } catch {
        return null;
      }
    },
    write(language: SupportedLanguage) {
      try {
        storage.setItem(storageKey, language);
      } catch {
        // The selected language remains active for the current session if storage is unavailable.
      }
    },
  };
}

export function createLocalStorageLanguagePreferenceStore(
  storage: Storage,
): LanguagePreferenceStore {
  return createLocalStorageLanguageStore(storage, languagePreferenceStorageKey);
}

export function createLocalStorageCardLanguagePreferenceStore(
  storage: Storage,
): LanguagePreferenceStore {
  return createLocalStorageLanguageStore(storage, cardLanguagePreferenceStorageKey);
}
