import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { TabooCard, ValidationIssue } from "../../business/games/taboo/model";
import {
  availableCategories,
  builtInCategories,
  customCategoryIds,
  type TabooCategoryInfo,
} from "../../business/games/taboo/categories";
import type { LineupIssue } from "../../business/shared/lineup";
import { initialTeamSetup, type TeamSetupValue } from "../../business/shared/teamSetup";
import type { SupportedLanguage } from "../../i18n";
import { useNotice } from "../components";
import { useGameBack, useGameExit } from "../GameChrome";
import { TabooClassicScreens } from "./TabooClassicScreens";
import type { TabooGenerators } from "./TabooGeneration";
import { TabooLineup } from "./TabooLineup";
import { usePlayedCards } from "./usePlayedCards";
import { TabooCountdownGame } from "./TabooCountdownGame";
import { TabooRaceGame } from "./TabooRaceGame";
import { TabooSetupForm } from "./TabooSetupForm";
import { defaultRoundChoices, type RoundChoice, type TabooScreen } from "./tabooSetupModel";
import type { TabooCountdownSession, TabooRaceSession } from "./tabooStartPlan";
import { useTabooClassicGame } from "./useTabooClassicGame";
import { useTabooSettingsView } from "./useTabooSettingsView";
import { useTabooStart } from "./useTabooStart";

interface TabooSetupProps {
  cardLanguage: SupportedLanguage;
  cards: readonly TabooCard[];
  /** The standard categories with their names; only those with cards are offered. */
  categoryInfos?: readonly TabooCategoryInfo[];
  children?: ReactNode;
  generators?: TabooGenerators | undefined;
  /** Changes the card language; without it the language is not offered in the settings. */
  onCardLanguageChange?: ((language: SupportedLanguage) => void) | undefined;
  /** Tells the host which screen is shown, so it can keep the scroll position of the menu. */
  onScreenChange?: ((screen: TabooScreen) => void) | undefined;
  /** Selectable rounds per team; tests use short games, the app offers short/medium/long/unlimited. */
  roundChoices?: readonly RoundChoice[];
}

/**
 * Taboo as a whole: the line-up is the first view, the settings are their own view above it, and a
 * started game runs in its mode. This container only joins the parts and keeps what they share:
 * the settings view (`useTabooSettingsView`), starting a game and its cards (`useTabooStart`), the
 * game of the mode "Klassisch" (`useTabooClassicGame`, shown by `TabooClassicScreens`) and the game
 * of the mode "Auf Zeit" (`TabooRaceGame`).
 */
export function TabooSetup({
  cardLanguage,
  cards,
  categoryInfos = builtInCategories,
  children,
  generators,
  onCardLanguageChange,
  onScreenChange,
  roundChoices = defaultRoundChoices,
}: TabooSetupProps) {
  const categoryIds = [
    ...availableCategories(categoryInfos, cards, cardLanguage).map((info) => info.id),
    ...customCategoryIds(
      cards,
      cardLanguage,
      categoryInfos.map((info) => info.id),
    ),
  ];
  const [issues, setIssues] = useState<readonly ValidationIssue[]>([]);
  // Counts the start attempts, so a message that is still true is shown again as a notification.
  const [attempt, setAttempt] = useState(0);
  const [teamSetup, setTeamSetup] = useState<TeamSetupValue>(initialTeamSetup);
  const [lineupNotice, notifyLineup] = useNotice<LineupIssue>();
  // The game of the mode "Auf Zeit"; the key starts it anew when the same setup is played again.
  const [raceSession, setRaceSession] = useState<TabooRaceSession>();
  const [countdownSession, setCountdownSession] = useState<TabooCountdownSession>();

  const settings = useTabooSettingsView({
    categoryIds,
    hasGenerators: Boolean(generators),
    setIssues,
  });
  const game = useTabooClassicGame({ cardLanguage, cards, generators });
  const played = usePlayedCards(cardLanguage);
  const { round, session, setSession } = game;
  const start = useTabooStart({
    cardLanguage,
    cards,
    categoryIds,
    countAttempt: () => setAttempt((count) => count + 1),
    game,
    generators,
    notifyLineup,
    played,
    readSettings: settings.readSettings,
    setIssues,
    setCountdownSession,
    setRaceSession,
    teamSetup,
  });

  // The cards of the classic game are remembered as they are shown.
  const classicState = game.round?.state;
  useEffect(() => {
    if (!classicState || !("resolvedCardIds" in classicState)) return;
    played.remember(
      classicState.status === "roundRunning"
        ? [...classicState.resolvedCardIds, classicState.card.id]
        : classicState.resolvedCardIds,
    );
  }, [classicState, played]);

  /** A new setup: an empty line-up and the settings as they start. */
  function startOver() {
    settings.resetForm();
    setTeamSetup(initialTeamSetup());
  }

  function restart(keepConfiguration: boolean) {
    start.setGenerationEmpty(false);
    game.clearRound();
    setIssues([]);
    if (!keepConfiguration) {
      setSession(undefined);
      startOver();
    } else if (session) {
      // Same settings: back to the line-up, where the teams can be drawn anew; the cards are reused.
      start.rememberDeck(session.deck);
      setSession(undefined);
    }
  }

  function restartRace(keepConfiguration: boolean) {
    if (!raceSession) return;
    if (!keepConfiguration) {
      setRaceSession(undefined);
      startOver();
      return;
    }
    // Same settings: back to the line-up, the cards of the race are reused.
    start.rememberDeck(raceSession.pool);
    setRaceSession(undefined);
  }

  function restartCountdown(keepConfiguration: boolean) {
    if (!countdownSession) return;
    if (!keepConfiguration) {
      setCountdownSession(undefined);
      startOver();
      return;
    }
    // Same settings: back to the line-up, the cards of the game are reused.
    start.rememberDeck(countdownSession.pool);
    setCountdownSession(undefined);
  }

  // Leaving a game returns to the main window with the previous setup still filled in.
  function leaveClassicGame() {
    game.clearRound();
    setSession(undefined);
    setIssues([]);
  }
  useGameExit(
    Boolean(round) || Boolean(session),
    leaveClassicGame,
    (game.runningTurn || game.tiebreakActive) && round
      ? { paused: round.pausedAt !== undefined, onToggle: game.togglePause }
      : undefined,
  );

  const lineupVisible =
    !settings.settingsOpen && !session && !round && !raceSession && !countdownSession;
  const settingsVisible =
    settings.settingsOpen && !session && !round && !raceSession && !countdownSession;
  const screen: TabooScreen = lineupVisible
    ? "lineup"
    : countdownSession
      ? "countdown"
      : raceSession
        ? "race"
        : round
          ? "game"
          : session
            ? "preparing"
            : "menu";
  useEffect(() => onScreenChange?.(screen), [onScreenChange, screen]);
  // In the settings the header offers a way back to the line-up.
  useGameBack(settingsVisible, () => {
    start.abort();
    settings.setSettingsOpen(false);
  });

  /** "Done" in the settings: back to the line-up, if the settings are complete. */
  function closeSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempt((count) => count + 1);
    if (!settings.readSettings()) return;
    setIssues([]);
    start.setShortage(undefined);
    game.setDeckEmpty(false);
    start.setGenerationEmpty(false);
    settings.setSettingsOpen(false);
  }

  /** Any change of the setup invalidates the prepared cards and a running preparation. */
  function handleFormChange() {
    start.abort();
    start.setShortage(undefined);
    setSession(undefined);
    setRaceSession(undefined);
    setCountdownSession(undefined);
    game.setDeckEmpty(false);
  }

  return (
    <div className="taboo-setup">
      <TabooClassicScreens
        game={game}
        generationEmpty={start.generationEmpty}
        onEndGame={leaveClassicGame}
        onNewSetup={() => restart(false)}
        onSameSetup={() => restart(true)}
      />
      {lineupVisible && (
        <TabooLineup
          attempt={attempt}
          deckEmpty={game.deckEmpty}
          generating={start.generating}
          issues={issues}
          lineupNotice={lineupNotice}
          onChange={(next) => {
            // A changed line-up invalidates the cards that are being prepared.
            start.abort();
            start.setShortage(undefined);
            setIssues([]);
            setTeamSetup(next);
          }}
          onOpenSettings={() => {
            start.abort();
            start.setShortage(undefined);
            settings.setSettingsOpen(true);
          }}
          onSubmit={(event) => void start.startGame(event)}
          shortage={start.shortage}
          value={teamSetup}
        />
      )}
      {countdownSession && (
        <TabooCountdownGame
          difficulties={countdownSession.difficulties}
          initial={countdownSession.state}
          onCardsPlayed={played.remember}
          key={`countdown-${countdownSession.key}`}
          onExit={() => setCountdownSession(undefined)}
          onNewSetup={() => restartCountdown(false)}
          onSameSetup={() => restartCountdown(true)}
          pool={countdownSession.pool}
        />
      )}
      {raceSession && (
        <TabooRaceGame
          cards={cards}
          difficulties={raceSession.difficulties}
          initial={raceSession.state}
          onCardsPlayed={played.remember}
          key={`race-${raceSession.key}`}
          onExit={() => setRaceSession(undefined)}
          onNewSetup={() => restartRace(false)}
          onSameSetup={() => restartRace(true)}
          pool={raceSession.pool}
        />
      )}
      <div
        className="taboo-setup__screen"
        hidden={!settingsVisible}
        key={`form-${settings.formVersion}`}
      >
        <TabooSetupForm
          attempt={attempt}
          formRef={settings.formRef}
          messagesVisible={settingsVisible}
          rulesActive={!(round ?? session ?? raceSession ?? countdownSession)}
          cardLanguage={cardLanguage}
          categoryIds={categoryIds}
          categoryInfos={categoryInfos}
          deckEmpty={game.deckEmpty}
          hasGenerators={Boolean(generators)}
          issues={issues}
          menuTab={settings.menuTab}
          mode={settings.mode}
          onCardLanguageChange={onCardLanguageChange}
          playedCards={played}
          onMenuTabChange={settings.setMenuTab}
          onChange={handleFormChange}
          onModeChange={(next) => {
            handleFormChange();
            settings.setMode(next);
          }}
          onSubmit={closeSettings}
          roundChoices={roundChoices}
          shortage={start.shortage}
        >
          {children}
        </TabooSetupForm>
      </div>
    </div>
  );
}
