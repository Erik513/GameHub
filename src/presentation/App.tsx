import { useTranslation } from "react-i18next";
import type { SupportedLanguage } from "../i18n";

const layerKeys = ["presentation", "business", "data", "infrastructure"] as const;

interface AppProps {
  onLanguageChange?: (language: SupportedLanguage) => void;
}

export function App({ onLanguageChange }: AppProps) {
  const { t, i18n } = useTranslation();
  const selectedLanguage: SupportedLanguage = i18n.resolvedLanguage === "de" ? "de" : "en";

  async function handleLanguageChange(language: SupportedLanguage) {
    await i18n.changeLanguage(language);
    onLanguageChange?.(language);
  }

  return (
    <main className="app-shell">
      <section className="foundation-card" aria-labelledby="gamehub-title">
        <label className="language-control">
          <span>{t("language.label")}</span>
          <select
            value={selectedLanguage}
            onChange={(event) =>
              void handleLanguageChange(event.currentTarget.value as SupportedLanguage)
            }
          >
            <option value="de">{t("language.options.de")}</option>
            <option value="en">{t("language.options.en")}</option>
          </select>
        </label>
        <p className="eyebrow">{t("app.eyebrow")}</p>
        <h1 id="gamehub-title">{t("app.title")}</h1>
        <p className="intro">{t("app.intro")}</p>
        <ul className="layer-list" aria-label={t("architecture.label")}>
          {layerKeys.map((layerKey) => (
            <li key={layerKey}>{t(`architecture.layers.${layerKey}`)}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
