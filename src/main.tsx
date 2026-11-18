import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppRoot } from "./app/AppRoot";
import { IndexedDbTabooCardRepository } from "./data/indexedDbTabooCardRepository";
import { tabooStandardCards } from "./data/tabooStandardCards";
import { loadTabooCardPack } from "./data/tabooCardPool";
import { gameHubI18n } from "./i18n";
import { parseSupportedLanguage, resolveInitialLanguage } from "./i18n/languagePreference";
import {
  createLocalStorageCardLanguagePreferenceStore,
  createLocalStorageLanguagePreferenceStore,
} from "./infrastructure/localStorageLanguagePreferenceStore";
import { createLocalStoragePlayerGroupStore } from "./infrastructure/localStoragePlayerGroupStore";
import { createLocalStoragePlayerRosterStore } from "./infrastructure/localStoragePlayerRosterStore";
import { createLocalStoragePlayedCardsStore } from "./infrastructure/localStoragePlayedCardsStore";
import { createLocalStorageTeamSetupMemory } from "./infrastructure/localStorageTeamSetupMemory";
import { createTabooModule } from "./presentation/taboo/tabooModule";
import "./presentation/styles/global.css";
import "./presentation/styles/kit-screen.css";
import "./presentation/styles/kit-hud.css";
import "./presentation/styles/kit-choice.css";
import "./presentation/styles/kit-result.css";
import "./presentation/styles/kit-info.css";
import "./presentation/styles/kit-setup.css";
import "./presentation/styles/kit-desktop.css";
import "./presentation/styles/games/taboo.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("GameHub root element is missing.");
}

const languagePreferenceStore = createLocalStorageLanguagePreferenceStore(window.localStorage);
const initialLanguage = resolveInitialLanguage(languagePreferenceStore.read(), navigator.languages);
const cardLanguagePreferenceStore = createLocalStorageCardLanguagePreferenceStore(
  window.localStorage,
);
const initialCardLanguage =
  parseSupportedLanguage(cardLanguagePreferenceStore.read()) ?? initialLanguage;
const playerRosterStore = createLocalStoragePlayerRosterStore(window.localStorage);
await gameHubI18n.changeLanguage(initialLanguage);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  const workerUrl = new URL(`${import.meta.env.BASE_URL}gamehub-sw.js`, document.baseURI);
  void navigator.serviceWorker.register(workerUrl).catch((error: unknown) => {
    console.warn("GameHub offline support could not be enabled.", error);
  });
}

createRoot(rootElement).render(
  <StrictMode>
    <AppRoot
      modules={[
        createTabooModule({
          cards: tabooStandardCards,
          loadCardPack: loadTabooCardPack,
          playedCards: createLocalStoragePlayedCardsStore(window.localStorage),
          // The card generators (Ollama, fixed list) are switched off for now: only the cards that
          // come with the app and the player's own cards can be played (docs ADR-024).
          repository: new IndexedDbTabooCardRepository(),
        }),
      ]}
      cardLanguagePreferenceStore={cardLanguagePreferenceStore}
      initialCardLanguage={initialCardLanguage}
      languagePreferenceStore={languagePreferenceStore}
      playerGroupStore={createLocalStoragePlayerGroupStore(window.localStorage, playerRosterStore)}
      playerRosterStore={playerRosterStore}
      teamSetupMemory={createLocalStorageTeamSetupMemory(window.localStorage)}
    />
  </StrictMode>,
);
