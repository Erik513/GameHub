import {
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { buildDeck, type DeckCriteria } from "../../business/games/taboo/deck";
import type { TabooCard, ValidationIssue } from "../../business/games/taboo/model";
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
import { shuffleTeams } from "../../business/shared/teamOrder";
import { pickTiebreakCard, pickTiebreakCards } from "../../business/games/taboo/tiebreakCards";
import { useGameExit } from "../GameChrome";
import { TabooRound } from "./TabooRound";
import { useTabooRefill } from "./useTabooRefill";
import { TabooResultView } from "./TabooResultView";
import { TabooSetupForm } from "./TabooSetupForm";
import { TabooTiebreakOverview } from "./TabooTiebreakOverview";
import { TabooTurnOverview } from "./TabooTurnOverview";
import {
  aiCardsPerTurn,
  defaultRoundChoices,
  difficulties,
  maxCardsPerRequest,
  teamNameFrom,
  type RoundChoice,
  type SetupState,
} from "./tabooSetupModel";
import { TabooTiebreakRound } from "./TabooTiebreakRound";
import { generateHiddenCards, type TabooGenerators } from "./TabooGeneration";

export function TabooSetup({
  cardLanguage,
  cards,
  categoryInfos = builtInCategories,
  children,
  generators,
  roundChoices = defaultRoundChoices,
}: {
  cardLanguage: SupportedLanguage;
  cards: readonly TabooCard[];
  /** The standard categories with their names; only those with cards are offered. */
  categoryInfos?: readonly TabooCategoryInfo[];
  children?: ReactNode;
  generators?: TabooGenerators | undefined;
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
  const [shortage, setShortage] = useState<{ available: number; required: number }>();
  const [round, setRound] = useState<{
    state: TabooState;
    deadline: number;
    pausedAt?: number | undefined;
    /** Tiebreak stopwatch: start of the attempt and total time spent paused. */
    startedAt?: number;
    pausedMs?: number;
  }>();
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
  // Whether the team order is drawn at random; a replay keeps a manual order.
  const [randomOrder, setRandomOrder] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationEmpty, setGenerationEmpty] = useState(false);
  const activeGeneration = useRef<AbortController | undefined>(undefined);
  useEffect(() => () => activeGeneration.current?.abort(), []);
  const [formVersion, setFormVersion] = useState(0);
  const [teamCount, setTeamCount] = useState(2);
  const [restartUnavailable, setRestartUnavailable] = useState(false);
  const [tiebreakNoCards, setTiebreakNoCards] = useState(false);
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
      setFormVersion((version) => version + 1);
      setTeamCount(2);
    } else if (session) {
      // Same setup: replay with the same cards in a fresh order.
      const reordered = createTabooGame({
        ...session.state.configuration,
        teams: randomOrder
          ? shuffleTeams(session.state.configuration.teams)
          : session.state.configuration.teams,
      });
      if (reordered.valid) setSession({ state: reordered.value, deck: shuffle(session.deck) });
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

  // All cards of the card language are available for the tiebreak, independent of the filters.
  const tiebreakPool = useMemo(() => {
    const language = round?.state.configuration.cardLanguage ?? cardLanguage;
    const unique = new Map<string, TabooCard>();
    for (const card of [...(session?.deck ?? []), ...cards]) {
      if (card.language === language) unique.set(card.id, card);
    }
    return [...unique.values()];
  }, [round?.state.configuration.cardLanguage, cardLanguage, cards, session]);

  function beginTiebreak() {
    if (round?.state.status !== "tiebreak") return;
    const picked = pickTiebreakCards(
      tiebreakPool,
      new Set(round.state.usedCardIds),
      new Set(round.state.resolvedCardIds),
    );
    const state = picked
      ? transitionTaboo(round.state, { type: "beginTiebreakAttempt", cards: picked })
      : round.state;
    if (state === round.state) {
      setTiebreakNoCards(true);
      return;
    }
    setTiebreakNoCards(false);
    setRound({ state, deadline: 0, startedAt: Date.now(), pausedMs: 0 });
  }

  function pickTiebreakReplacement(card: TabooCard) {
    if (round?.state.status !== "tiebreak") return undefined;
    return pickTiebreakCard(
      tiebreakPool,
      card.difficulty,
      new Set(round.state.usedCardIds),
      new Set(round.state.resolvedCardIds),
    );
  }

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

  // Leaving a game returns to the main window with the previous setup still filled in.
  useGameExit(
    Boolean(round) || Boolean(session),
    () => {
      refill.reset();
      setRound(undefined);
      setSession(undefined);
      setDeckEmpty(false);
      setIssues([]);
    },
    (runningTurn || tiebreakActive) && round
      ? { paused: round.pausedAt !== undefined, onToggle: togglePause }
      : undefined,
  );

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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeGeneration.current) return;
    setGenerationEmpty(false);
    setDeckEmpty(false);
    setShortage(undefined);
    setSession(undefined);
    const data = new FormData(event.currentTarget);
    const entered = Array.from({ length: Number(data.get("teamCount")) }, (_, index) => ({
      id: String(index + 1),
      name:
        teamNameFrom(data.get(`teamName${index + 1}`)) ||
        t("tabooSetup.team", { number: index + 1 }),
    }));
    const random = data.get("teamOrder") !== "entered";
    setRandomOrder(random);
    const result = createTabooGame({
      teams: random ? shuffleTeams(entered) : entered,
      roundsPerTeam: data.get("rounds") === "unlimited" ? "unlimited" : Number(data.get("rounds")),
      roundDurationSeconds: Number(data.get("duration")),
      ...(data.get("tiebreak") === "off" ? {} : { tiebreak: true }),
      ...(data.get("skips") === "unlimited" || !data.has("skips")
        ? {}
        : { skipsPerRound: Number(data.get("skips")) }),
      cardLanguage,
    });
    if (!result.valid) {
      setIssues(result.issues);
      return;
    }
    const selectedCategories = categoryIds.filter((category) =>
      data.getAll("category").includes(category),
    );
    if (selectedCategories.length === 0) {
      setIssues([{ field: "categories", code: "required" }]);
      return;
    }
    setIssues([]);
    const { roundsPerTeam } = result.value.configuration;
    // With unlimited rounds one card per team is enough to start; cards are reused later.
    const required =
      result.value.configuration.teams.length * (roundsPerTeam === "unlimited" ? 1 : roundsPerTeam);
    const filters: DeckCriteria = {
      language: result.value.configuration.cardLanguage,
      minimumCards: 1,
      categoryIds: selectedCategories.length === categoryIds.length ? [] : selectedCategories,
      difficulties: difficulties.filter((difficulty) =>
        data.getAll("difficulty").includes(difficulty),
      ),
    };
    const chosenDifficulties = filters.difficulties?.length ? filters.difficulties : difficulties;
    const cardSource = generators ? data.get("cardSource") : "local";
    refill.configure(
      cardSource === "ai"
        ? {
            language: filters.language,
            categories: selectedCategories,
            difficulties: chosenDifficulties,
          }
        : undefined,
    );
    let additions: readonly TabooCard[] = [];
    if (generators && (cardSource === "ai" || cardSource === "both")) {
      const controller = new AbortController();
      activeGeneration.current = controller;
      setGenerating(true);
      // Mixed decks only add a few extras. AI-only decks must last a full timed round per turn,
      // so they are generated generously instead of one card per turn.
      const perCategory =
        cardSource === "ai"
          ? Math.max(2, Math.ceil((required * aiCardsPerTurn) / selectedCategories.length))
          : 2;
      const requests = selectedCategories.flatMap((categoryId) =>
        Array.from({ length: Math.ceil(perCategory / maxCardsPerRequest) }, (_, index) => ({
          language: filters.language,
          categoryId,
          difficulty: chosenDifficulties[index % chosenDifficulties.length] ?? "easy",
          count: Math.min(maxCardsPerRequest, perCategory - index * maxCardsPerRequest),
        })),
      );
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
    const deck = buildDeck(pool, filters, Math.random).cards;
    if (deck.length < required) {
      setShortage({ available: deck.length, required });
      return;
    }
    const active = { state: result.value, deck };
    setSession(active);
  }

  function handleFormChange(event: FormEvent<HTMLFormElement>) {
    if (event.target instanceof HTMLInputElement && event.target.name === "teamCount") {
      setTeamCount(Number(event.target.value));
    }
    activeGeneration.current?.abort();
    setShortage(undefined);
    setSession(undefined);
    setDeckEmpty(false);
  }

  return (
    <div className="taboo-setup">
      {tiebreakState && !tiebreakState.active && (
        <TabooTiebreakOverview
          noCards={tiebreakNoCards}
          onBegin={beginTiebreak}
          onNewSetup={() => restart(false)}
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
          pickReplacement={pickTiebreakReplacement}
          startedAt={round.startedAt}
          teamName={tiebreakState.configuration.teams[tiebreakState.active.teamIndex]?.name ?? ""}
        />
      )}
      {finished && (
        <TabooResultView
          finished={finished}
          onNewSetup={() => restart(false)}
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
        hidden={Boolean(round) || Boolean(session)}
        key={formVersion}
      >
        <TabooSetupForm
          categoryIds={categoryIds}
          categoryInfos={categoryInfos}
          deckEmpty={deckEmpty}
          generating={generating}
          hasGenerators={Boolean(generators)}
          issues={issues}
          onChange={handleFormChange}
          onSubmit={(event) => void submit(event)}
          roundChoices={roundChoices}
          shortage={shortage}
          teamCount={teamCount}
        >
          {children}
        </TabooSetupForm>
      </div>
    </div>
  );
}
