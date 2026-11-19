import { useCallback, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { SupportedLanguage } from "../i18n";
import { BrandMark, Button, ConfirmButton, Dialog, Icon } from "./components";
import {
  GameChromeContext,
  GameRulesContext,
  type GameExit,
  type GameRulesAction,
} from "./GameChrome";
import { ActionRow, PlayerRosterButton } from "./game-kit";
import { SettingsDialog } from "./SettingsDialog";
import { useSystemBack } from "./useSystemBack";

interface AppShellProps {
  children: ReactNode;
  gameTitle?: string | undefined;
  onCloseGame?: (() => void) | undefined;
  onLanguageChange: (language: SupportedLanguage) => void;
}

export function AppShell({ children, gameTitle, onCloseGame, onLanguageChange }: AppShellProps) {
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gameExit, setGameExit] = useState<GameExit>();
  const gameExits = useRef<GameExit[]>([]);
  const registerGameExit = useCallback((exit: GameExit | undefined, remove?: GameExit) => {
    if (exit) gameExits.current = [...gameExits.current, exit];
    else gameExits.current = remove ? gameExits.current.filter((entry) => entry !== remove) : [];
    setGameExit(gameExits.current[gameExits.current.length - 1]);
  }, []);
  // The Back key of the system: in a sub page of a game it goes one step back like the arrow in the
  // header; in a running game it asks first, and a running round is paused while the question is open.
  const [leaveAsked, setLeaveAsked] = useState(false);
  const pausedByQuestion = useRef(false);
  useSystemBack(gameExit !== undefined, () => {
    if (!gameExit) return;
    if (gameExit.back) {
      gameExit.run();
      return;
    }
    if (gameExit.pause && !gameExit.pause.paused) {
      gameExit.pause.toggle();
      pausedByQuestion.current = true;
    }
    setLeaveAsked(true);
  });
  function keepPlaying() {
    setLeaveAsked(false);
    if (pausedByQuestion.current) gameExit?.pause?.toggle();
    pausedByQuestion.current = false;
  }
  function endGameNow() {
    setLeaveAsked(false);
    pausedByQuestion.current = false;
    gameExit?.run();
  }

  // The main menu of a game puts its rules into the header, where the GameHub has the players.
  const [rulesAction, setRulesAction] = useState<GameRulesAction>();
  const registerGameRules = useCallback(
    (action: GameRulesAction | undefined) => setRulesAction(action),
    [],
  );

  // The home button is the last button at the top right of the main menu of a game.
  const homeButton = onCloseGame ? (
    <Button
      aria-label={t("navigation.closeGame")}
      className="icon-button"
      title={t("navigation.closeGame")}
      variant="secondary"
      onClick={onCloseGame}
    >
      <svg aria-hidden="true" focusable="false" height="20" viewBox="0 0 24 24" width="20">
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
  ) : null;

  return (
    <div className="app-shell">
      <header className="site-header">
        {gameTitle ? (
          <p className="brand">
            <span>{gameTitle}</span>
          </p>
        ) : (
          <a className="brand" href="#/" aria-label="GameHub">
            <BrandMark />
            <span>GameHub</span>
          </a>
        )}
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
              {rulesAction ? (
                <Button onClick={rulesAction.open} variant="secondary">
                  <Icon name="book" />
                  {t("kitSetup.rulesButton")}
                </Button>
              ) : (
                <PlayerRosterButton />
              )}
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
              {homeButton}
            </>
          )}
        </div>
      </header>
      <GameChromeContext.Provider value={registerGameExit}>
        <GameRulesContext.Provider value={registerGameRules}>
          <main className="main-content">{children}</main>
        </GameRulesContext.Provider>
      </GameChromeContext.Provider>
      <Dialog
        closeLabel={t("settings.close")}
        description={t("navigation.leaveGameText")}
        onClose={keepPlaying}
        open={leaveAsked && gameExit !== undefined && !gameExit.back}
        title={t("navigation.leaveGameTitle")}
      >
        <ActionRow>
          <Button variant="success" onClick={keepPlaying}>
            {t("navigation.keepPlaying")}
          </Button>
          <Button variant="danger" onClick={endGameNow}>
            {t("navigation.exitGame")}
          </Button>
        </ActionRow>
      </Dialog>
      <SettingsDialog
        onClose={() => setSettingsOpen(false)}
        onLanguageChange={onLanguageChange}
        open={settingsOpen}
      />
    </div>
  );
}
