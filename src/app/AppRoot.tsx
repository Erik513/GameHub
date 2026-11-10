import { I18nextProvider } from "react-i18next";
import { gameHubI18n } from "../i18n";
import type { LanguagePreferenceStore } from "../i18n/languagePreference";
import { App } from "../presentation/App";

interface AppRootProps {
  languagePreferenceStore?: LanguagePreferenceStore;
}

export function AppRoot({ languagePreferenceStore }: AppRootProps) {
  return (
    <I18nextProvider i18n={gameHubI18n}>
      <App onLanguageChange={(language) => languagePreferenceStore?.write(language)} />
    </I18nextProvider>
  );
}
