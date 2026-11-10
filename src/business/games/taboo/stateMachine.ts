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

interface Setup {
  readonly status: "setup";
  readonly configuration: GameConfiguration;
}

interface TurnState {
  readonly configuration: GameConfiguration;
  readonly turn: Turn;
}

export type TabooState =
  | Setup
  | (TurnState & { readonly status: "roundRunning"; readonly card: TabooCard })
  | (TurnState & { readonly status: "roundEnded" | "gameEnded" });

export type TabooEvent =
  | { readonly type: "startRound"; readonly card: TabooCard }
  | { readonly type: "endRound"; readonly turn: Turn }
  | { readonly type: "finishGame" };

export function createTabooGame(input: GameConfiguration): ValidationResult<Setup> {
  const result = validateConfiguration(input);
  return result.valid
    ? { valid: true, value: { status: "setup", configuration: result.value } }
    : result;
}

export function transitionTaboo(state: TabooState, event: TabooEvent): TabooState {
  const { configuration } = state;
  if (event.type === "endRound") {
    if (
      state.status !== "roundRunning" ||
      event.turn.round !== state.turn.round ||
      event.turn.teamIndex !== state.turn.teamIndex
    )
      return state;
    return { status: "roundEnded", configuration, turn: state.turn };
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
  const card = validateCard(event.card);
  if (!card.valid || card.value.language !== configuration.cardLanguage) return state;
  return { status: "roundRunning", configuration, turn, card: card.value };
}
