import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { planGenerationRequests, requiredCards } from "../../business/games/taboo/cardPlan";
import { buildDeck, type DeckCriteria } from "../../business/games/taboo/deck";
import { createRaceGame, type RaceState } from "../../business/games/taboo/race";
import { raceCardShortage } from "../../business/games/taboo/raceCards";
import type { Difficulty, TabooCard, ValidationIssue } from "../../business/games/taboo/model";
import {
  createTabooGame,
  getNextTabooTurn,
  transitionTaboo,
  type TabooEvent,
  type TabooState,
} from "../../business/games/taboo/stateMachine";
import type { SupportedLanguage } from "../../i18n";
import { shuffle } from "../../business/shared/shuffle";
import {
  availableCategories,
  builtInCategories,
  customCategoryIds,
  type TabooCategoryInfo,
} from "../../business/games/taboo/categories";
import { tabooLineup } from "../../business/games/taboo/lineup";
import { resolveLineup, validateLineup, type LineupIssue } from "../../business/shared/lineup";
import { buildTeams, initialTeamSetup, type TeamSetupValue } from "../../business/shared/teamSetup";
import { hasTeamSetupContent } from "../../business/shared/savedTeamSetup";
import { Toast, useNotice } from "../components";
import { useGameBack, useGameExit } from "../GameChrome";
import { LineupScreen, LineupSetup, useTeamSetupMemory } from "../game-kit";
import { TabooRaceGame } from "./TabooRaceGame";
import { TabooRound } from "./TabooRound";
import { useTabooRefill } from "./useTabooRefill";
import { TabooResultView } from "./TabooResultView";
import { TabooSetupForm } from "./TabooSetupForm";
import { TabooSetupMessages } from "./TabooSetupMessages";
import type { TabooScreen } from "./tabooSetupModel";
import { TabooTiebreakOverview } from "./TabooTiebreakOverview";
import { TabooTurnOverview } from "./TabooTurnOverview";
import {
  defaultRoundChoices,
  difficulties,
  type RoundChoice,
  readTabooSettings,
  type SetupState,
  type TabooMode,
  type TabooSettings,
} from "./tabooSetupModel";
import { TabooTiebreakRound } from "./TabooTiebreakRound";
import { useTabooTiebreak, type ActiveGame } from "./useTabooTiebreak";
import { generateHiddenCards, type TabooGenerators } from "./TabooGeneration";

export function TabooSetup({
  cardLanguage,
  cards,
  categoryInfos = builtInCategories,
  children,
  generators,
  onCardLanguageChange,
  onScreenChange,
  roundChoices = defaultRoundChoices,
}: {
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
}) {
  const { t } = useTranslation();
  const categoryIds = [
    ...availableCategories(categoryInfos, cards, cardLanguage).map((info) => info.id),
    ...customCategoryIds(
      cards,
      cardLanguage,
      categoryInfos.map((info) => info.id),
    ),
  ];
  const [issues, setIssues] = useState<readonly ValidationIssue[]>([]);
  const [session, setSession] = useState<{ state: SetupState; deck: readonly TabooCard[] }>();
  const [shortage, setShortage] = useState<{
    available: number;
    difficulty?: Difficulty;
    required: number;
  }>();
  const [mode, setMode] = useState<TabooMode>("classic");
  // The settings of the main menu, read when "Start" is pressed; the line-up follows.
  const [settings, setSettings] = useState<TabooSettings>();
  const [menuTab, setMenuTab] = useState("settings");
  const [lineupOpen, setLineupOpen] = useState(false);
  // The cards of the game that was just played; a replay with the same settings reuses them.
  const replayDeck = useRef<readonly TabooCard[] | undefined>(undefined);
  // The game of the mode "Auf Zeit"; the key starts it anew when the same setup is played again.
  const [raceSession, setRaceSession] = useState<{
    /** The difficulties of the game; every team gets the same mix of them. */
    difficulties: readonly Difficulty[];
    key: number;
    pool: readonly TabooCard[];
    state: RaceState;
  }>();
  const [round, setRound] = useState<ActiveGame>();
  const dispatch = useCallback((event: TabooEvent) => {
    setRound((current) => {
      if (!current) return current;
      const state = transitionTaboo(current.state, event);
      return state === current.state ? current : { ...current, state };
    });
  }, []);
  const runningRound = round?.state.status === "roundRunning" ? round.state : undefined;
  const refill = useTabooRefill({
    cards,
    deck: session?.deck,
    dispatch,
    generators,
    running: runningRound,
  });
  const [deckEmpty, setDeckEmpty] = useState(false);
  // Counts the start attempts, so a message that is still true is shown again as a notification.
  const [attempt, setAttempt] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generationEmpty, setGenerationEmpty] = useState(false);
  const activeGeneration = useRef<AbortController | undefined>(undefined);
  useEffect(() => () => activeGeneration.current?.abort(), []);
  const [formVersion, setFormVersion] = useState(0);
  const [teamSetup, setTeamSetup] = useState<TeamSetupValue>(initialTeamSetup);
  const [lineupNotice, notifyLineup] = useNotice<LineupIssue>();
  const memory = useTeamSetupMemory();
  const [restartUnavailable, setRestartUnavailable] = useState(false);
  const ended = round?.state.status === "roundEnded" ? round.state : undefined;
  const finished = round?.state.status === "gameEnded" ? round.state : undefined;
  const nextTurn = ended ? getNextTabooTurn(ended) : null;
  // With unlimited rounds the group may stop after every completed round.
  const canFinishEarly =
    ended !== undefined &&
    nextTurn !== null &&
    ended.configuration.roundsPerTeam === "unlimited" &&
    ended.turn.teamIndex === ended.configuration.teams.length - 1;

  const overview =
    ended && round
      ? { ...ended, turn: nextTurn }
      : session && !round
        ? { ...session.state, turn: { round: 1, teamIndex: 0 } }
        : undefined;

  function restart(keepConfiguration: boolean) {
    setGenerationEmpty(false);
    refill.reset();
    setRound(undefined);
    setDeckEmpty(false);
    setIssues([]);
    if (!keepConfiguration) {
      setSession(undefined);
      setSettings(undefined);
      setLineupOpen(false);
      setFormVersion((version) => version + 1);
      setTeamSetup(initialTeamSetup());
    } else if (session) {
      // Same settings: back to the line-up, where the teams can be drawn anew; the cards are reused.
      replayDeck.current = session.deck;
      setSession(undefined);
      setLineupOpen(true);
    }
  }

  const togglePause = useCallback(() => {
    setRestartUnavailable(false);
    setRound((current) => {
      if (!current) return current;
      const { pausedAt } = current;
      if (current.state.status === "roundRunning") {
        // Resuming moves the deadline by the time spent paused.
        if (pausedAt === undefined) return { ...current, pausedAt: Date.now() };
        return { state: current.state, deadline: current.deadline + (Date.now() - pausedAt) };
      }
      if (current.state.status === "tiebreak" && current.state.active) {
        if (pausedAt === undefined) return { ...current, pausedAt: Date.now() };
        return {
          state: current.state,
          deadline: current.deadline,
          ...(current.startedAt === undefined ? {} : { startedAt: current.startedAt }),
          pausedMs: (current.pausedMs ?? 0) + (Date.now() - pausedAt),
        };
      }
      return current;
    });
  }, []);

  const runningTurn = round?.state.status === "roundRunning" ? round.state.turn : undefined;
  const tiebreakState = round?.state.status === "tiebreak" ? round.state : undefined;
  const tiebreakActive = tiebreakState?.active !== undefined;

  const tiebreak = useTabooTiebreak({
    cards,
    cardLanguage,
    deck: session?.deck,
    dispatch,
    round,
    setRound,
  });

  // A restarted turn gets new cards: nothing shown in this turn may reappear (no peeking).
  const restartTurn = useCallback(() => {
    if (!session || round?.state.status !== "roundRunning") return;
    const turnState = round.state;
    const shown = new Set([turnState.card.id, ...turnState.results.map((r) => r.card.id)]);
    const played = new Set([...turnState.resolvedCardIds, turnState.card.id]);
    const candidates = session.deck.filter((candidate) => !shown.has(candidate.id));
    const [card, ...remainingCards] = [
      ...candidates.filter((candidate) => !played.has(candidate.id)),
      ...shuffle(candidates.filter((candidate) => played.has(candidate.id))),
    ];
    const state = card
      ? transitionTaboo(turnState, {
          type: "restartRound",
          turn: turnState.turn,
          card,
          remainingCards,
        })
      : turnState;
    if (state === turnState) {
      setRestartUnavailable(true);
      return;
    }
    setRestartUnavailable(false);
    setRound({ state, deadline: Date.now() + state.configuration.roundDurationSeconds * 1000 });
  }, [round, session]);

  function restartRace(keepConfiguration: boolean) {
    if (!raceSession) return;
    if (!keepConfiguration) {
      setRaceSession(undefined);
      setSettings(undefined);
      setLineupOpen(false);
      setFormVersion((version) => version + 1);
      setTeamSetup(initialTeamSetup());
      return;
    }
    // Same settings: back to the line-up, the cards of the race are reused.
    replayDeck.current = raceSession.pool;
    setRaceSession(undefined);
    setLineupOpen(true);
  }

  // Leaving a game returns to the main window with the previous setup still filled in.
  useGameExit(
    Boolean(round) || Boolean(session),
    () => {
      refill.reset();
      setRound(undefined);
      setSession(undefined);
      setLineupOpen(false);
      setDeckEmpty(false);
      setIssues([]);
    },
    (runningTurn || tiebreakActive) && round
      ? { paused: round.pausedAt !== undefined, onToggle: togglePause }
      : undefined,
  );

  const lineupVisible = lineupOpen && !session && !round && !raceSession && Boolean(settings);
  const screen: TabooScreen = lineupVisible
    ? "lineup"
    : raceSession
      ? "race"
      : round
        ? "game"
        : session
          ? "preparing"
          : "menu";
  useEffect(() => onScreenChange?.(screen), [onScreenChange, screen]);
  // On the line-up the header offers a way back to the main menu.
  useGameBack(lineupVisible, () => {
    activeGeneration.current?.abort();
    setLineupOpen(false);
    setShortage(undefined);
    setIssues([]);
  });

  function startRound(
    active: { state: SetupState; deck: readonly TabooCard[] } | undefined = session,
    base: TabooState | undefined = round?.state,
  ) {
    if (!active) return;
    const current = base ?? active.state;
    const { teams, roundsPerTeam } = current.configuration;
    const completed =
      current.status === "roundEnded"
        ? (current.turn.round - 1) * teams.length + current.turn.teamIndex + 1
        : 0;
    if (roundsPerTeam !== "unlimited" && teams.length * roundsPerTeam - completed <= 0) return;
    // A turn never ends because of cards: unplayed cards come first, then earlier cards in new order.
    const used = new Set(current.resolvedCardIds);
    const [card, ...remainingCards] = [
      ...active.deck.filter((candidate) => !used.has(candidate.id)),
      ...shuffle(active.deck.filter((candidate) => used.has(candidate.id))),
    ];
    if (!card) {
      setDeckEmpty(true);
      return;
    }
    const state = transitionTaboo(current, { type: "startRound", card, remainingCards });
    if (state.status !== "roundRunning" || state === current) return;
    setDeckEmpty(false);
    setRestartUnavailable(false);
    setRound({
      state,
      deadline: Date.now() + state.configuration.roundDurationSeconds * 1000,
    });
  }

  /** The main menu: the settings are read once, then the line-up of the teams follows. */
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempt((count) => count + 1);
    if (activeGeneration.current) return;
    const read = readTabooSettings(new FormData(event.currentTarget), {
      categoryIds,
      hasGenerators: Boolean(generators),
      mode,
    });
    if (read.categories.length === 0) {
      setIssues([{ field: "categories", code: "required" }]);
      // The categories are in the cards tab; show it so the problem can be fixed.
      setMenuTab("cards");
      return;
    }
    setIssues([]);
    setShortage(undefined);
    setDeckEmpty(false);
    setGenerationEmpty(false);
    setSettings(read);
    setLineupOpen(true);
  }

  /** The line-up: the teams are known now, so the game and its cards are prepared and it starts. */
  async function startGame(event: FormEvent<HTMLFormElement>) {
    setAttempt((count) => count + 1);
    event.preventDefault();
    if (activeGeneration.current || !settings) return;
    // The game's own rules for the line-up (Taboo leaves players without a team out).
    const lineupIssue = validateLineup(tabooLineup, teamSetup)[0];
    if (lineupIssue) {
      notifyLineup(lineupIssue);
      return;
    }
    setGenerationEmpty(false);
    setDeckEmpty(false);
    setShortage(undefined);
    setSession(undefined);
    const reusable = replayDeck.current;
    replayDeck.current = undefined;
    const teams = buildTeams(resolveLineup(tabooLineup, teamSetup), {
      defaultName: (number) => t("kitTeams.defaultName", { number }),
    });
    const raceTarget = settings.raceTarget;
    const classic =
      settings.mode === "classic"
        ? createTabooGame({
            teams,
            roundsPerTeam: settings.rounds,
            roundDurationSeconds: settings.duration,
            ...(settings.tiebreak ? { tiebreak: true } : {}),
            ...(settings.skips === undefined ? {} : { skipsPerRound: settings.skips }),
            cardLanguage,
          })
        : undefined;
    const race =
      settings.mode === "race"
        ? createRaceGame({ teams, cardLanguage, target: raceTarget })
        : undefined;
    const checked = classic ?? race;
    if (!checked?.valid) {
      setIssues(checked?.issues ?? []);
      return;
    }
    setIssues([]);
    // The group is remembered for the next game, of any game.
    if (hasTeamSetupContent(teamSetup)) memory?.write(teamSetup);
    const selectedCategories = settings.categories;
    const teamCount = checked.value.configuration.teams.length;
    // With unlimited rounds one card per team is enough to start; cards are reused later. A race
    // never uses a card twice, so it needs the cards of all runs and two spare ones per team.
    const required = requiredCards({
      mode: race?.valid ? "race" : "classic",
      raceTarget,
      roundsPerTeam: classic?.valid ? classic.value.configuration.roundsPerTeam : 1,
      teamCount,
    });
    const filters: DeckCriteria = {
      language: checked.value.configuration.cardLanguage,
      minimumCards: 1,
      categoryIds: selectedCategories.length === categoryIds.length ? [] : selectedCategories,
      difficulties: settings.difficulties,
    };
    const chosenDifficulties = filters.difficulties?.length ? filters.difficulties : difficulties;
    const cardSource = settings.cardSource;
    refill.configure(
      cardSource === "ai"
        ? {
            language: filters.language,
            categories: selectedCategories,
            difficulties: chosenDifficulties,
          }
        : undefined,
    );
    // A race needs enough cards of every difficulty it uses, so every team gets the same mix.
    const shortageOf = (candidate: readonly TabooCard[]) =>
      race?.valid
        ? raceCardShortage(candidate, teamCount, raceTarget, chosenDifficulties)
        : candidate.length < required
          ? { available: candidate.length, required }
          : undefined;
    // A replay reuses the cards of the game before when they are enough for the new line-up.
    let deck: readonly TabooCard[] | undefined =
      reusable && !shortageOf(reusable) ? shuffle(reusable) : undefined;
    if (!deck) {
      let additions: readonly TabooCard[] = [];
      if (generators && (cardSource === "ai" || cardSource === "both")) {
        const controller = new AbortController();
        activeGeneration.current = controller;
        setGenerating(true);
        const requests = planGenerationRequests({
          categories: selectedCategories,
          difficulties: chosenDifficulties,
          language: filters.language,
          mode: race?.valid ? "race" : "classic",
          required,
          source: cardSource,
        });
        try {
          additions = await generateHiddenCards(generators, requests, cards, controller.signal);
        } catch {
          additions = [];
        } finally {
          activeGeneration.current = undefined;
          setGenerating(false);
        }
        if (controller.signal.aborted) return;
        setGenerationEmpty(additions.length === 0);
      }
      const pool = cardSource === "ai" ? additions : [...cards, ...additions];
      deck = buildDeck(pool, filters, Math.random).cards;
    }
    const missing = shortageOf(deck);
    if (missing) {
      setShortage(missing);
      return;
    }
    setLineupOpen(false);
    if (race?.valid) {
      setRaceSession({
        difficulties: chosenDifficulties,
        key: 0,
        pool: deck,
        state: race.value,
      });
      return;
    }
    if (classic?.valid) setSession({ state: classic.value, deck });
  }

  /** Any change of the setup invalidates the prepared cards and a running preparation. */
  function handleFormChange() {
    activeGeneration.current?.abort();
    setShortage(undefined);
    setSession(undefined);
    setRaceSession(undefined);
    setDeckEmpty(false);
  }

  return (
    <div className="taboo-setup">
      {tiebreakState && !tiebreakState.active && (
        <TabooTiebreakOverview
          noCards={tiebreak.noCards}
          onBegin={tiebreak.begin}
          onNewSetup={() => restart(false)}
          onRevise={tiebreak.revise}
          state={tiebreakState}
        />
      )}
      {tiebreakState?.active && round?.startedAt !== undefined && (
        <TabooTiebreakRound
          active={tiebreakState.active}
          dispatch={dispatch}
          onResume={togglePause}
          pausedAt={round.pausedAt}
          pausedMs={round.pausedMs ?? 0}
          pickReplacement={tiebreak.pickReplacement}
          startedAt={round.startedAt}
          teamName={tiebreakState.configuration.teams[tiebreakState.active.teamIndex]?.name ?? ""}
        />
      )}
      {lineupVisible && (
        <LineupScreen
          ariaLabel={t("tabooLineup.label")}
          formId="taboo-lineup-form"
          messages={
            <>
              <TabooSetupMessages
                attempt={attempt}
                deckEmpty={deckEmpty}
                issues={issues}
                shortage={shortage}
              />
              {lineupNotice && (
                <Toast key={lineupNotice.id} tone="error">
                  {t(`kitLineup.${lineupNotice.value.code}`, { count: lineupNotice.value.count })}
                </Toast>
              )}
            </>
          }
          onSubmit={(event) => void startGame(event)}
          startDisabled={generating}
          startLabel={t(generating ? "tabooSetup.preparingCards" : "tabooLineup.start")}
        >
          <LineupSetup
            config={tabooLineup}
            onChange={(next) => {
              // A changed line-up invalidates the cards that are being prepared.
              activeGeneration.current?.abort();
              setShortage(undefined);
              setIssues([]);
              setTeamSetup(next);
            }}
            value={teamSetup}
          />
        </LineupScreen>
      )}
      {raceSession && (
        <TabooRaceGame
          difficulties={raceSession.difficulties}
          initial={raceSession.state}
          key={`race-${raceSession.key}`}
          onExit={() => {
            setRaceSession(undefined);
            setLineupOpen(false);
          }}
          onNewSetup={() => restartRace(false)}
          onSameSetup={() => restartRace(true)}
          pool={raceSession.pool}
        />
      )}
      {finished && (
        <TabooResultView
          finished={finished}
          onNewSetup={() => restart(false)}
          onRevise={tiebreak.revise}
          onSameSetup={() => restart(true)}
        />
      )}
      {round?.state.status === "roundRunning" && (
        <TabooRound
          deadline={round.deadline}
          dispatch={dispatch}
          onResume={togglePause}
          onRestart={restartTurn}
          restartUnavailable={restartUnavailable}
          paused={round.pausedAt !== undefined}
          state={round.state}
        />
      )}
      {overview && (
        <TabooTurnOverview
          canFinishEarly={canFinishEarly}
          deckEmpty={deckEmpty}
          ended={ended}
          generationEmpty={generationEmpty}
          onFinish={() => dispatch({ type: "finishGame" })}
          onNewSetup={() => restart(false)}
          onRevise={(cardId, outcome) =>
            ended && dispatch({ type: "reviseResult", turn: ended.turn, cardId, outcome })
          }
          onStart={() => startRound()}
          overview={overview}
        />
      )}
      <div
        className="taboo-setup__screen"
        hidden={Boolean(round) || Boolean(session) || Boolean(raceSession) || lineupVisible}
        key={`form-${formVersion}`}
      >
        <TabooSetupForm
          attempt={attempt}
          messagesVisible={!(round ?? session ?? raceSession ?? lineupVisible)}
          cardLanguage={cardLanguage}
          categoryIds={categoryIds}
          categoryInfos={categoryInfos}
          deckEmpty={deckEmpty}
          generating={generating}
          hasGenerators={Boolean(generators)}
          issues={issues}
          menuTab={menuTab}
          mode={mode}
          onCardLanguageChange={onCardLanguageChange}
          onMenuTabChange={setMenuTab}
          onChange={handleFormChange}
          onModeChange={(next) => {
            handleFormChange();
            setMode(next);
          }}
          onSubmit={(event) => void submit(event)}
          roundChoices={roundChoices}
          shortage={shortage}
        >
          {children}
        </TabooSetupForm>
      </div>
    </div>
  );
}
