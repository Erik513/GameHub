import { useTranslation } from "react-i18next";

const layerKeys = ["presentation", "business", "data", "infrastructure"] as const;

export function App() {
  const { t } = useTranslation();

  return (
    <main className="app-shell">
      <section className="foundation-card" aria-labelledby="gamehub-title">
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
