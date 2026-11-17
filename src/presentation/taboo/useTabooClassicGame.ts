import { useCallback, useState } from "react";
import type { TabooCard } from "../../business/games/taboo/model";
import {
  getNextTabooTurn,
  transitionTaboo,
  type TabooEvent,
  type TabooState,
} from "../../business/games/taboo/stateMachine";
import { shuffle } from "../../business/shared/shuffle";
import type { SupportedLanguage } from "../../i18n";
import type { TabooGenerators } from "./TabooGeneration";
import type { SetupState } from "./tabooSetupModel";
import { useTabooRefill } from "./useTabooRefill";
import { useTabooTiebreak, type ActiveGame } from "./useTabooTiebreak";

/** A prepared game: its state before the first turn and the cards it plays with. */
export interface TabooSession {
  readonly deck: readonly TabooCard[];
  readonly state: SetupState;
}

interface ClassicGameOptions {
  readonly cardLanguage: SupportedLanguage;
  readonly cards: readonly TabooCard[];
  readonly generators: TabooGenerators | undefined;
}

/**
 * The game of the mode "Klassisch" while it is played: the prepared game, the running turn with its
 * clock, pause, restart of a turn, the next turn, the tiebreak and the cards that are added in the
 * background. The rules are in the state machine; this hook drives them with the clock and the deck.
 */
export function useTabooClassicGame({ cardLanguage, cards, generators }: ClassicGameOptions) {
  const [session, setSession] = useState<TabooSession>();
  const [round, setRound] = useState<ActiveGame>();
  const [deckEmpty, setDeckEmpty] = useState(false);
  const [restartUnavailable, setRestartUnavailable] = useState(false);
  // After a tiebreak the last attempt is checked first; only then the final screen follows.
  // (The configuration of a game stays the same object until the game ends, so it tells which game.)
  const [wrapUpFor, setWrapUpFor] = useState<object>();

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
  const tiebreak = useTabooTiebreak({
    cards,
    cardLanguage,
    deck: session?.deck,
    dispatch,
    round,
    setRound,
  });

  const ended = round?.state.status === "roundEnded" ? round.state : undefined;
  const finished = round?.state.status === "gameEnded" ? round.state : undefined;
  const wrapUpDone = finished !== undefined && wrapUpFor === finished.configuration;
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
  const runningTurn = runningRound?.turn;
  const tiebreakState = round?.state.status === "tiebreak" ? round.state : undefined;
  const tiebreakActive = tiebreakState?.active !== undefined;

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

  /** Starts the next turn, by default the first one of the prepared game or the one after the last. */
  function startRound(active: TabooSession | undefined = session, base?: TabooState) {
    if (!active) return;
    const current = base ?? round?.state ?? active.state;
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

  /** Forgets the running turn and what belongs to it; the prepared game stays. */
  function clearRound() {
    refill.reset();
    setRound(undefined);
    setDeckEmpty(false);
  }

  return {
    canFinishEarly,
    clearRound,
    deckEmpty,
    dispatch,
    ended,
    finished,
    overview,
    refill,
    restartTurn,
    restartUnavailable,
    round,
    runningTurn,
    session,
    setDeckEmpty,
    setRestartUnavailable,
    setSession,
    setWrapUpDone: () => finished && setWrapUpFor(finished.configuration),
    startRound,
    tiebreak,
    tiebreakActive,
    tiebreakState,
    togglePause,
    wrapUpDone,
  };
}

export type TabooClassicGame = ReturnType<typeof useTabooClassicGame>;
