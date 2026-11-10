import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { SupportedLanguage } from "../i18n";

interface AppShellProps {
  cardLanguage: SupportedLanguage;
  children: ReactNode;
  currentRoute: string;
  onCardLanguageChange: (language: SupportedLanguage) => void;
  onLanguageChange: (language: SupportedLanguage) => void;
}

export function AppShell({
  cardLanguage,
  children,
  currentRoute,
  onCardLanguageChange,
  onLanguageChange,
}: AppShellProps) {
  const { t, i18n } = useTranslation();
  const selectedLanguage: SupportedLanguage = i18n.resolvedLanguage === "de" ? "de" : "en";

  async function handleLanguageChange(language: SupportedLanguage) {
    await i18n.changeLanguage(language);
    onLanguageChange(language);
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#/" aria-label="GameHub">
          <span className="brand__mark" aria-hidden="true" />
          <span>GameHub</span>
        </a>
        <nav aria-label={t("navigation.ariaLabel")}>
          <a
            className="nav-link"
            href="#/"
            aria-current={currentRoute === "/" ? "page" : undefined}
          >
            {t("navigation.home")}
          </a>
        </nav>
        <div className="language-controls">
          <label className="language-control">
            <span>{t("language.uiLabel")}</span>
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
          <label className="language-control">
            <span>{t("language.cardLabel")}</span>
            <select
              value={cardLanguage}
              onChange={(event) =>
                onCardLanguageChange(event.currentTarget.value as SupportedLanguage)
              }
            >
              <option value="de">{t("language.options.de")}</option>
              <option value="en">{t("language.options.en")}</option>
            </select>
          </label>
        </div>
      </header>
      <main className="main-content">{children}</main>
    </div>
  );
}
