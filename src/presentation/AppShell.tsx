import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { SupportedLanguage } from "../i18n";
import { Button } from "./components";
import { SettingsDialog } from "./SettingsDialog";

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
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);

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
        <Button
          className="settings-button"
          variant="secondary"
          onClick={() => setSettingsOpen(true)}
        >
          {t("settings.open")}
        </Button>
      </header>
      <main className="main-content">{children}</main>
      <SettingsDialog
        cardLanguage={cardLanguage}
        onCardLanguageChange={onCardLanguageChange}
        onClose={() => setSettingsOpen(false)}
        onLanguageChange={onLanguageChange}
        open={settingsOpen}
      />
    </div>
  );
}
