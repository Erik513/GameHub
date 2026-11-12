import { useCallback, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { SupportedLanguage } from "../i18n";
import { Button, ConfirmButton, Icon } from "./components";
import { GameChromeContext, type GameExit } from "./GameChrome";
import { PlayerRosterButton } from "./game-kit";
import { SettingsDialog } from "./SettingsDialog";

interface AppShellProps {
  children: ReactNode;
  currentRoute: string;
  gameTitle?: string | undefined;
  onCloseGame?: (() => void) | undefined;
  onLanguageChange: (language: SupportedLanguage) => void;
}

export function AppShell({
  children,
  currentRoute,
  gameTitle,
  onCloseGame,
  onLanguageChange,
}: AppShellProps) {
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gameExit, setGameExit] = useState<GameExit>();
  const registerGameExit = useCallback((exit: GameExit | undefined) => setGameExit(exit), []);

  return (
    <div className="app-shell">
      <header className="site-header">
        {gameTitle ? (
          <p className="brand">
            <span className="brand__mark" aria-hidden="true" />
            <span>{gameTitle}</span>
          </p>
        ) : (
          <a className="brand" href="#/" aria-label="GameHub">
            <span className="brand__mark" aria-hidden="true" />
            <span>GameHub</span>
          </a>
        )}
        <nav aria-label={t("navigation.ariaLabel")}>
          <a
            className="nav-link"
            href="#/"
            aria-current={currentRoute === "/" ? "page" : undefined}
          >
            {t("navigation.home")}
          </a>
        </nav>
        <div className="site-header__actions">
          {gameExit?.back ? (
            <Button
              aria-label={t("navigation.back")}
              className="icon-button"
              title={t("navigation.back")}
              variant="secondary"
              onClick={() => gameExit.run()}
            >
              <Icon name="arrowLeft" />
            </Button>
          ) : gameExit ? (
            <>
              {gameExit.pause && (
                <Button
                  aria-label={t(gameExit.pause.paused ? "navigation.resume" : "navigation.pause")}
                  aria-pressed={gameExit.pause.paused}
                  className="icon-button"
                  title={t(gameExit.pause.paused ? "navigation.resume" : "navigation.pause")}
                  variant="secondary"
                  onClick={gameExit.pause.toggle}
                >
                  {gameExit.pause.paused ? (
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      height="20"
                      viewBox="0 0 24 24"
                      width="20"
                    >
                      <path d="M7 4.5v15l12-7.5z" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      height="20"
                      viewBox="0 0 24 24"
                      width="20"
                    >
                      <path
                        d="M8 5v14M16 5v14"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="3"
                      />
                    </svg>
                  )}
                </Button>
              )}
              {!gameExit.pause && (
                <ConfirmButton
                  armedContent={
                    <>
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        height="20"
                        viewBox="0 0 24 24"
                        width="20"
                      >
                        <path
                          d="M5 5l14 14M19 5L5 19"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="2.5"
                        />
                      </svg>
                      <span>{t("navigation.exitGameConfirm")}</span>
                    </>
                  }
                  armedLabel={t("navigation.exitGameConfirm")}
                  className="icon-button"
                  idleLabel={t("navigation.exitGame")}
                  onConfirm={() => gameExit.run()}
                >
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    height="20"
                    viewBox="0 0 24 24"
                    width="20"
                  >
                    <path
                      d="M5 5l14 14M19 5L5 19"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2.5"
                    />
                  </svg>
                </ConfirmButton>
              )}
            </>
          ) : (
            <>
              {!gameTitle && <PlayerRosterButton />}
              <Button
                aria-label={t("settings.open")}
                className="icon-button"
                title={t("settings.open")}
                variant="secondary"
                onClick={() => setSettingsOpen(true)}
              >
                <svg
                  aria-hidden="true"
                  focusable="false"
                  height="20"
                  viewBox="0 0 24 24"
                  width="20"
                >
                  <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="6.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </Button>
              {onCloseGame && (
                <Button
                  aria-label={t("navigation.closeGame")}
                  className="icon-button"
                  title={t("navigation.closeGame")}
                  variant="secondary"
                  onClick={onCloseGame}
                >
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    height="20"
                    viewBox="0 0 24 24"
                    width="20"
                  >
                    <path
                      d="M3 11.5 12 4l9 7.5M5.5 10v9.5h4.5v-6h4v6h4.5V10"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </Button>
              )}
            </>
          )}
        </div>
      </header>
      <GameChromeContext.Provider value={registerGameExit}>
        <main className="main-content">{children}</main>
      </GameChromeContext.Provider>
      <SettingsDialog
        onClose={() => setSettingsOpen(false)}
        onLanguageChange={onLanguageChange}
        open={settingsOpen}
      />
    </div>
  );
}
