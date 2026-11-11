import {
  validateCard,
  validateConfiguration,
  type GameConfiguration,
  type TabooCard,
  type ValidationResult,
} from "./model";

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

export type TabooOutcome = "correct" | "skipped" | "forbiddenWord";

export interface TabooResult {
  readonly card: TabooCard;
  readonly outcome: TabooOutcome;
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
  | (TurnState & { readonly status: "gameEnded"; readonly winnerIds: readonly string[] });

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
  | { readonly type: "endRound"; readonly turn: Turn }
  | {
      readonly type: "reviseResult";
      readonly turn: Turn;
      readonly cardId: string;
      readonly outcome: TabooOutcome;
    }
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
    // Skipped cards are not part of the scoring and cannot be revised.
    if (!previous || previous.outcome === "skipped" || event.outcome === "skipped") return state;
    if (previous.outcome === event.outcome) return state;
    const delta = Number(event.outcome === "correct") - Number(previous.outcome === "correct");
    return {
      ...state,
      roundPoints: state.roundPoints + delta,
      scores: scores.map((score, index) =>
        index === state.turn.teamIndex ? score + delta : score,
      ),
      results: state.results.map((result) =>
        result === previous ? { ...result, outcome: event.outcome } : result,
      ),
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

  if (state.status !== "setup" && state.status !== "roundEnded") return state;
  let turn: Turn = { round: 1, teamIndex: 0 };
  if (state.status === "roundEnded") {
    const nextTurn = getNextTabooTurn(state);
    if (!nextTurn) {
      if (event.type !== "finishGame") return state;
      const highestScore = scores.reduce((highest, score) => Math.max(highest, score), 0);
      const winnerIds = configuration.teams
        .filter((_, index) => scores[index] === highestScore)
        .map((team) => team.id);
      return { ...state, status: "gameEnded", winnerIds };
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

export function countSkips(results: readonly TabooResult[]): number {
  return results.filter((result) => result.outcome === "skipped").length;
}

export function getNextTabooTurn(
  state: Extract<TabooState, { status: "roundEnded" }>,
): Turn | null {
  const { configuration, turn } = state;
  const nextTeam = turn.teamIndex + 1;
  if (nextTeam < configuration.teams.length) return { round: turn.round, teamIndex: nextTeam };
  if (turn.round >= configuration.roundsPerTeam) return null;
  return { round: turn.round + 1, teamIndex: 0 };
}
