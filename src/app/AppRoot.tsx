import { I18nextProvider } from "react-i18next";
import { gameHubI18n } from "../i18n";
import { App } from "../presentation/App";

export function AppRoot() {
  return (
    <I18nextProvider i18n={gameHubI18n}>
      <App />
    </I18nextProvider>
  );
}
