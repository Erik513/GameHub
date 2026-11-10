import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppRoot } from "./app/AppRoot";
import { IndexedDbTabooCardRepository } from "./data/indexedDbTabooCardRepository";
import { tabooStandardCards } from "./data/tabooStandardCards";
import { tabooLocalCandidates } from "./data/tabooLocalCandidates";
import { createLocalTabooCardGenerator } from "./infrastructure/localTabooCardGenerator";
import { createOllamaTabooCardGenerator } from "./infrastructure/ollamaTabooCardGenerator";
import { gameHubI18n } from "./i18n";
import { parseSupportedLanguage, resolveInitialLanguage } from "./i18n/languagePreference";
import {
  createLocalStorageCardLanguagePreferenceStore,
  createLocalStorageLanguagePreferenceStore,
} from "./infrastructure/localStorageLanguagePreferenceStore";
import "./presentation/styles/global.css";

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
      tabooGenerators={{
        local: createLocalTabooCardGenerator(tabooLocalCandidates),
        ollama: (model) => createOllamaTabooCardGenerator({ model }),
      }}
      tabooRepository={new IndexedDbTabooCardRepository()}
      tabooCards={tabooStandardCards}
      cardLanguagePreferenceStore={cardLanguagePreferenceStore}
      initialCardLanguage={initialCardLanguage}
      languagePreferenceStore={languagePreferenceStore}
    />
  </StrictMode>,
);
