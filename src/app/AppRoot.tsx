import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import type { TabooCard } from "../business/games/taboo/model";
import type { TabooCardRepository } from "../business/games/taboo/cardRepository";
import { gameHubI18n, type SupportedLanguage } from "../i18n";
import type { LanguagePreferenceStore } from "../i18n/languagePreference";
import { App } from "../presentation/App";

interface AppRootProps {
  tabooRepository?: TabooCardRepository | undefined;
  tabooCards?: readonly TabooCard[];
  cardLanguagePreferenceStore?: LanguagePreferenceStore;
  initialCardLanguage?: SupportedLanguage;
  languagePreferenceStore?: LanguagePreferenceStore;
}

export function AppRoot({
  tabooRepository,
  tabooCards = [],
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
        tabooRepository={tabooRepository}
        tabooCards={tabooCards}
        cardLanguage={cardLanguage}
        onCardLanguageChange={handleCardLanguageChange}
        onLanguageChange={(language) => languagePreferenceStore?.write(language)}
      />
    </I18nextProvider>
  );
}
