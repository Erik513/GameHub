export type GameHubLanguage = "de" | "en";

export interface LanguageSettings {
  readonly uiLanguage: GameHubLanguage;
  readonly cardLanguage: GameHubLanguage;
}

export function createLanguageSettings(
  uiLanguage: GameHubLanguage,
  cardLanguage: GameHubLanguage = uiLanguage,
): LanguageSettings {
  return { uiLanguage, cardLanguage };
}

export function changeUiLanguage(
  settings: LanguageSettings,
  uiLanguage: GameHubLanguage,
): LanguageSettings {
  return { ...settings, uiLanguage };
}

export function changeCardLanguage(
  settings: LanguageSettings,
  cardLanguage: GameHubLanguage,
): LanguageSettings {
  return { ...settings, cardLanguage };
}
