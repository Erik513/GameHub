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

interface TurnState extends GameState {
  readonly turn: Turn;
}

export type TabooState =
  | Setup
  | (TurnState & {
      readonly status: "roundRunning";
      readonly card: TabooCard;
      readonly remainingCards: readonly TabooCard[];
    })
  | (TurnState & { readonly status: "roundEnded" | "gameEnded" });

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
      readonly outcome: "correct" | "skipped" | "forbiddenWord";
    }
  | { readonly type: "endRound"; readonly turn: Turn }
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
  if (event.type === "resolveCard") {
    if (
      state.status !== "roundRunning" ||
      event.turn.round !== state.turn.round ||
      event.turn.teamIndex !== state.turn.teamIndex ||
      event.cardId !== state.card.id
    )
      return state;

    const updated = {
      configuration,
      turn: state.turn,
      scores: scores.map((score, index) =>
        event.outcome === "correct" && index === state.turn.teamIndex ? score + 1 : score,
      ),
      resolvedCardIds: [...resolvedCardIds, event.cardId],
    };
    const [card, ...remainingCards] = state.remainingCards;
    return card
      ? { ...updated, status: "roundRunning", card, remainingCards }
      : { ...updated, status: "roundEnded" };
  }
  if (event.type === "endRound") {
    if (
      state.status !== "roundRunning" ||
      event.turn.round !== state.turn.round ||
      event.turn.teamIndex !== state.turn.teamIndex
    )
      return state;
    return { status: "roundEnded", configuration, turn: state.turn, scores, resolvedCardIds };
  }

  if (state.status !== "setup" && state.status !== "roundEnded") return state;
  let turn: Turn = { round: 1, teamIndex: 0 };
  if (state.status === "roundEnded") {
    const nextTeam = state.turn.teamIndex + 1;
    const lastTeam = nextTeam === configuration.teams.length;
    const complete = lastTeam && state.turn.round === configuration.roundsPerTeam;
    if (complete) {
      return event.type === "finishGame" ? { ...state, status: "gameEnded" } : state;
    }
    turn = lastTeam
      ? { round: state.turn.round + 1, teamIndex: 0 }
      : { round: state.turn.round, teamIndex: nextTeam };
  }

  if (event.type !== "startRound") return state;
  const seen = new Set(resolvedCardIds);
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
    card,
    remainingCards,
    scores,
    resolvedCardIds,
  };
}
