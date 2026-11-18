import {
  validateCard,
  validateConfiguration,
  type GameConfiguration,
  type TabooCard,
  type ValidationResult,
} from "./model";
import { reviseOutcome, type TabooOutcome, type TabooResult } from "./outcome";
import {
  isTiebreakTie,
  reviseTiebreakAttempts,
  stepTiebreak,
  tiebreakWinnerIds,
  type TiebreakActive,
  type TiebreakAttempt,
  type TiebreakEvent,
} from "./tiebreak";

// The outcome of a card and the tiebreak are shared by all game modes; they stay importable from here.
export { reviseOutcome, type TabooOutcome, type TabooResult } from "./outcome";
export {
  TIEBREAK_CARD_COUNT,
  TIEBREAK_LIMIT_SECONDS,
  type TiebreakActive,
  type TiebreakAttempt,
  type TiebreakEvent,
} from "./tiebreak";

interface Turn {
  readonly round: number;
  readonly teamIndex: number;
}

interface GameState {
  readonly configuration: GameConfiguration;
  readonly scores: readonly number[];
  readonly resolvedCardIds: readonly string[];
}

interface Setup extends GameState {
  readonly status: "setup";
}

interface TurnState extends GameState {
  readonly turn: Turn;
  readonly roundPoints: number;
  readonly results: readonly TabooResult[];
}

export type TabooState =
  | Setup
  | (TurnState & {
      readonly status: "roundRunning";
      readonly card: TabooCard;
      readonly remainingCards: readonly TabooCard[];
    })
  | (TurnState & { readonly status: "roundEnded" })
  | (TurnState & {
      readonly status: "tiebreak";
      /** Team indexes of the tied teams in playing order. */
      readonly contenders: readonly number[];
      readonly attempts: readonly TiebreakAttempt[];
      readonly usedCardIds: readonly string[];
      readonly active?: TiebreakActive;
    })
  | (TurnState & {
      readonly status: "gameEnded";
      readonly winnerIds: readonly string[];
      readonly tiebreak?: readonly TiebreakAttempt[];
    });

export type TabooEvent =
  | {
      readonly type: "startRound";
      readonly card: TabooCard;
      readonly remainingCards?: readonly TabooCard[];
    }
  | {
      readonly type: "resolveCard";
      readonly turn: Turn;
      readonly cardId: string;
      readonly outcome: TabooOutcome;
    }
  | {
      readonly type: "addCards";
      readonly turn: Turn;
      readonly cards: readonly TabooCard[];
    }
  | {
      readonly type: "restartRound";
      readonly turn: Turn;
      readonly card: TabooCard;
      readonly remainingCards?: readonly TabooCard[];
    }
  | { readonly type: "endRound"; readonly turn: Turn }
  | {
      readonly type: "reviseResult";
      readonly turn: Turn;
      readonly cardId: string;
      readonly outcome: TabooOutcome;
    }
  | TiebreakEvent
  | { readonly type: "finishGame" };

export function createTabooGame(input: GameConfiguration): ValidationResult<Setup> {
  const result = validateConfiguration(input);
  return result.valid
    ? {
        valid: true,
        value: {
          status: "setup",
          configuration: result.value,
          scores: result.value.teams.map(() => 0),
          resolvedCardIds: [],
        },
      }
    : result;
}

export function transitionTaboo(state: TabooState, event: TabooEvent): TabooState {
  const { configuration, scores, resolvedCardIds } = state;
  if (event.type === "reviseResult") {
    if (
      state.status !== "roundEnded" ||
      event.turn.round !== state.turn.round ||
      event.turn.teamIndex !== state.turn.teamIndex
    )
      return state;
    const previous = state.results.find((result) => result.card.id === event.cardId);
    // Skipped cards are not part of the scoring; a card marked wrong cannot become correct.
    const revised = previous ? reviseOutcome(previous, event.outcome) : undefined;
    if (!previous || !revised) return state;
    const delta = Number(event.outcome === "correct") - Number(previous.outcome === "correct");
    return {
      ...state,
      roundPoints: state.roundPoints + delta,
      scores: scores.map((score, index) =>
        index === state.turn.teamIndex ? score + delta : score,
      ),
      results: state.results.map((result) => (result === previous ? revised : result)),
    };
  }
  if (event.type === "resolveCard") {
    if (
      state.status !== "roundRunning" ||
      event.turn.round !== state.turn.round ||
      event.turn.teamIndex !== state.turn.teamIndex ||
      event.cardId !== state.card.id
    )
      return state;

    const { skipsPerRound } = configuration;
    if (
      event.outcome === "skipped" &&
      skipsPerRound !== undefined &&
      countSkips(state.results) >= skipsPerRound
    )
      return state;

    const updated = {
      configuration,
      turn: state.turn,
      roundPoints: state.roundPoints + (event.outcome === "correct" ? 1 : 0),
      scores: scores.map((score, index) =>
        event.outcome === "correct" && index === state.turn.teamIndex ? score + 1 : score,
      ),
      resolvedCardIds: resolvedCardIds.includes(event.cardId)
        ? resolvedCardIds
        : [...resolvedCardIds, event.cardId],
      results: [...state.results, { card: state.card, outcome: event.outcome }],
    };
    const [card, ...remainingCards] = state.remainingCards;
    return card
      ? { ...updated, status: "roundRunning", card, remainingCards }
      : { ...updated, status: "roundEnded" };
  }
  if (event.type === "addCards") {
    if (
      state.status !== "roundRunning" ||
      event.turn.round !== state.turn.round ||
      event.turn.teamIndex !== state.turn.teamIndex
    )
      return state;
    // Cards may return in a later turn, but never twice within the same turn.
    const seen = new Set([
      state.card.id,
      ...state.remainingCards.map((c) => c.id),
      ...state.results.map((result) => result.card.id),
    ]);
    const additions: TabooCard[] = [];
    for (const input of event.cards) {
      const result = validateCard(input);
      if (
        !result.valid ||
        result.value.language !== configuration.cardLanguage ||
        seen.has(result.value.id)
      )
        continue;
      seen.add(result.value.id);
      additions.push(result.value);
    }
    return additions.length === 0
      ? state
      : { ...state, remainingCards: [...state.remainingCards, ...additions] };
  }
  if (event.type === "restartRound") {
    if (
      state.status !== "roundRunning" ||
      event.turn.round !== state.turn.round ||
      event.turn.teamIndex !== state.turn.teamIndex
    )
      return state;
    // The turn starts over with new cards: cards already shown in this turn may not return, so
    // the team cannot profit from having seen them.
    const seen = new Set([state.card.id, ...state.results.map((result) => result.card.id)]);
    const cards: TabooCard[] = [];
    for (const input of [event.card, ...(event.remainingCards ?? [])]) {
      const result = validateCard(input);
      if (
        !result.valid ||
        result.value.language !== configuration.cardLanguage ||
        seen.has(result.value.id)
      )
        return state;
      seen.add(result.value.id);
      cards.push(result.value);
    }
    const [card, ...remainingCards] = cards;
    if (!card) return state;
    return {
      ...state,
      card,
      remainingCards,
      roundPoints: 0,
      results: [],
      resolvedCardIds: resolvedCardIds.includes(state.card.id)
        ? resolvedCardIds
        : [...resolvedCardIds, state.card.id],
      scores: scores.map((score, index) =>
        index === state.turn.teamIndex ? score - state.roundPoints : score,
      ),
    };
  }
  if (event.type === "endRound") {
    if (
      state.status !== "roundRunning" ||
      event.turn.round !== state.turn.round ||
      event.turn.teamIndex !== state.turn.teamIndex
    )
      return state;
    return {
      status: "roundEnded",
      configuration,
      turn: state.turn,
      scores,
      resolvedCardIds,
      roundPoints: state.roundPoints,
      results: state.results,
    };
  }

  if (
    event.type === "beginTiebreakAttempt" ||
    event.type === "answerTiebreak" ||
    event.type === "endTiebreakAttempt" ||
    event.type === "reviseTiebreakResult"
  )
    return transitionTiebreak(state, event);

  if (state.status !== "setup" && state.status !== "roundEnded") return state;
  let turn: Turn = { round: 1, teamIndex: 0 };
  if (state.status === "roundEnded") {
    const nextTurn = getNextTabooTurn(state);
    const roundComplete = state.turn.teamIndex === configuration.teams.length - 1;
    const mayFinish = !nextTurn || (configuration.roundsPerTeam === "unlimited" && roundComplete);
    if (event.type === "finishGame" && !mayFinish) return state;
    if (!nextTurn || (event.type === "finishGame" && mayFinish)) {
      if (event.type !== "finishGame") return state;
      const highestScore = scores.reduce((highest, score) => Math.max(highest, score), 0);
      const leaders = configuration.teams
        .map((team, index) => ({ team, index }))
        .filter(({ index }) => scores[index] === highestScore);
      if (configuration.tiebreak === true && isTiebreakTie(leaders.length)) {
        return {
          ...state,
          status: "tiebreak",
          contenders: leaders.map(({ index }) => index),
          attempts: [],
          usedCardIds: [],
        };
      }
      return { ...state, status: "gameEnded", winnerIds: leaders.map(({ team }) => team.id) };
    }
    turn = nextTurn;
  }

  if (event.type !== "startRound") return state;
  const seen = new Set<string>();
  const cards: TabooCard[] = [];
  for (const input of [event.card, ...(event.remainingCards ?? [])]) {
    const result = validateCard(input);
    if (
      !result.valid ||
      result.value.language !== configuration.cardLanguage ||
      seen.has(result.value.id)
    )
      return state;
    seen.add(result.value.id);
    cards.push(result.value);
  }
  const [card, ...remainingCards] = cards;
  if (!card) return state;
  return {
    status: "roundRunning",
    configuration,
    turn,
    roundPoints: 0,
    results: [],
    card,
    remainingCards,
    scores,
    resolvedCardIds,
  };
}

/** A tiebreak of this game: the shared rules in `tiebreak.ts`, with the cards the game has played. */
function transitionTiebreak(state: TabooState, event: TiebreakEvent): TabooState {
  const { configuration } = state;
  const context = { cardLanguage: configuration.cardLanguage, teams: configuration.teams };
  if (event.type === "reviseTiebreakResult") {
    if (state.status === "tiebreak" && !state.active) {
      const attempts = reviseTiebreakAttempts(state.attempts, event);
      return attempts ? { ...state, attempts } : state;
    }
    if (state.status === "gameEnded" && state.tiebreak) {
      const attempts = reviseTiebreakAttempts(state.tiebreak, event);
      return attempts
        ? {
            ...state,
            tiebreak: attempts,
            winnerIds: tiebreakWinnerIds(context.teams, attempts),
          }
        : state;
    }
    return state;
  }
  if (state.status !== "tiebreak") return state;
  const step = stepTiebreak(context, state, event);
  if (!step) return state;
  const base = {
    configuration,
    scores: state.scores,
    turn: state.turn,
    roundPoints: state.roundPoints,
    results: state.results,
  };
  if ("part" in step) {
    const { part } = step;
    // The cards of a tiebreak attempt count as played in the game.
    const resolvedCardIds =
      event.type === "beginTiebreakAttempt" && part.active
        ? [
            ...state.resolvedCardIds,
            ...part.active.cards
              .map((card) => card.id)
              .filter((id) => !state.resolvedCardIds.includes(id)),
          ]
        : state.resolvedCardIds;
    return {
      ...base,
      resolvedCardIds,
      status: "tiebreak",
      contenders: part.contenders,
      attempts: part.attempts,
      usedCardIds: part.usedCardIds,
      ...(part.active ? { active: part.active } : {}),
    };
  }
  return {
    ...base,
    resolvedCardIds: state.resolvedCardIds,
    status: "gameEnded",
    winnerIds: step.winnerIds,
    tiebreak: step.attempts,
  };
}

/**
 * Whether ending the game now leads to a tiebreak: the tiebreak is switched on and two or more teams
 * share the lead. Otherwise the final result follows.
 */
export function tiebreakFollows(
  configuration: GameConfiguration,
  scores: readonly number[],
): boolean {
  const highestScore = scores.reduce((highest, score) => Math.max(highest, score), 0);
  const leaders = scores.filter((score) => score === highestScore).length;
  return configuration.tiebreak === true && isTiebreakTie(leaders);
}

export function countSkips(results: readonly TabooResult[]): number {
  return results.filter((result) => result.outcome === "skipped").length;
}

export function getNextTabooTurn(
  state: Extract<TabooState, { status: "roundEnded" }>,
): Turn | null {
  const { configuration, turn } = state;
  const nextTeam = turn.teamIndex + 1;
  if (nextTeam < configuration.teams.length) return { round: turn.round, teamIndex: nextTeam };
  if (configuration.roundsPerTeam !== "unlimited" && turn.round >= configuration.roundsPerTeam)
    return null;
  return { round: turn.round + 1, teamIndex: 0 };
}
