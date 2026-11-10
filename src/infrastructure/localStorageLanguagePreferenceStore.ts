import type { SupportedLanguage } from "../i18n";
import type { LanguagePreferenceStore } from "../i18n/languagePreference";

export const languagePreferenceStorageKey = "gamehub.uiLanguage";

export function createLocalStorageLanguagePreferenceStore(
  storage: Storage,
): LanguagePreferenceStore {
  return {
    read() {
      try {
        return storage.getItem(languagePreferenceStorageKey);
      } catch {
        return null;
      }
    },
    write(language: SupportedLanguage) {
      try {
        storage.setItem(languagePreferenceStorageKey, language);
      } catch {
        // The selected language remains active for the current session if storage is unavailable.
      }
    },
  };
}
