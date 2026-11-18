import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { gameHubI18n, type SupportedLanguage } from "../i18n";
import type { PlayerGroupStore } from "../business/shared/playerGroups";
import type { PlayerRosterStore } from "../business/shared/playerRoster";
import type { TeamSetupMemory } from "../business/shared/savedTeamSetup";
import type { LanguagePreferenceStore } from "../i18n/languagePreference";
import { App } from "../presentation/App";
import { PlayerRosterProvider, TeamSetupMemoryProvider } from "../presentation/game-kit";
import { useDocumentLanguage } from "./useDocumentLanguage";
import type { GameModule } from "../presentation/gameModule";

interface AppRootProps {
  modules?: readonly GameModule[];
  cardLanguagePreferenceStore?: LanguagePreferenceStore;
  initialCardLanguage?: SupportedLanguage;
  languagePreferenceStore?: LanguagePreferenceStore;
  /** Keeps the saved players of all games. */
  playerRosterStore?: PlayerRosterStore;
  /** Keeps the groups of the saved players. */
  playerGroupStore?: PlayerGroupStore;
  /** Remembers the last teams and players for all games. */
  teamSetupMemory?: TeamSetupMemory;
}

function DocumentLanguage() {
  useDocumentLanguage();
  return null;
}

export function AppRoot({
  modules = [],
  cardLanguagePreferenceStore,
  initialCardLanguage = "en",
  languagePreferenceStore,
  playerGroupStore,
  playerRosterStore,
  teamSetupMemory,
}: AppRootProps) {
  const [cardLanguage, setCardLanguage] = useState(initialCardLanguage);

  function handleCardLanguageChange(language: SupportedLanguage) {
    setCardLanguage(language);
    cardLanguagePreferenceStore?.write(language);
  }

  return (
    <I18nextProvider i18n={gameHubI18n}>
      <DocumentLanguage />
      <PlayerRosterProvider
        defaultGroupName={gameHubI18n.t("kitRoster.defaultGroup")}
        groupStore={playerGroupStore}
        store={playerRosterStore}
      >
        <TeamSetupMemoryProvider memory={teamSetupMemory}>
          <App
            modules={modules}
            cardLanguage={cardLanguage}
            onCardLanguageChange={handleCardLanguageChange}
            onLanguageChange={(language) => languagePreferenceStore?.write(language)}
          />
        </TeamSetupMemoryProvider>
      </PlayerRosterProvider>
    </I18nextProvider>
  );
}
