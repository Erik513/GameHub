import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { gameHubI18n, type SupportedLanguage } from "../i18n";
import type { LanguagePreferenceStore } from "../i18n/languagePreference";
import { App } from "../presentation/App";

interface AppRootProps {
  cardLanguagePreferenceStore?: LanguagePreferenceStore;
  initialCardLanguage?: SupportedLanguage;
  languagePreferenceStore?: LanguagePreferenceStore;
}

export function AppRoot({
  cardLanguagePreferenceStore,
  initialCardLanguage = "en",
  languagePreferenceStore,
}: AppRootProps) {
  const [cardLanguage, setCardLanguage] = useState(initialCardLanguage);

  function handleCardLanguageChange(language: SupportedLanguage) {
    setCardLanguage(language);
    cardLanguagePreferenceStore?.write(language);
  }

  return (
    <I18nextProvider i18n={gameHubI18n}>
      <App
        cardLanguage={cardLanguage}
        onCardLanguageChange={handleCardLanguageChange}
        onLanguageChange={(language) => languagePreferenceStore?.write(language)}
      />
    </I18nextProvider>
  );
}
