import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppRoot } from "./app/AppRoot";
import { gameHubI18n } from "./i18n";
import { resolveInitialLanguage } from "./i18n/languagePreference";
import { createLocalStorageLanguagePreferenceStore } from "./infrastructure/localStorageLanguagePreferenceStore";
import "./presentation/styles/global.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("GameHub root element is missing.");
}

const languagePreferenceStore = createLocalStorageLanguagePreferenceStore(window.localStorage);
const initialLanguage = resolveInitialLanguage(languagePreferenceStore.read(), navigator.languages);
await gameHubI18n.changeLanguage(initialLanguage);

createRoot(rootElement).render(
  <StrictMode>
    <AppRoot languagePreferenceStore={languagePreferenceStore} />
  </StrictMode>,
);
