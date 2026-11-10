import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppRoot } from "./app/AppRoot";
import { tabooStandardCards } from "./data/tabooStandardCards";
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

createRoot(rootElement).render(
  <StrictMode>
    <AppRoot
      tabooCards={tabooStandardCards}
      cardLanguagePreferenceStore={cardLanguagePreferenceStore}
      initialCardLanguage={initialCardLanguage}
      languagePreferenceStore={languagePreferenceStore}
    />
  </StrictMode>,
);
