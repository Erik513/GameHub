import type { GameHubLanguage } from "../../settings/languageSettings";
import {
  validateCard,
  validateTeams,
  type Team,
  type TabooCard,
  type ValidationIssue,
  type ValidationResult,
} from "./model";
import type { TabooOutcome } from "./outcome";

/**
 * Mode "Gegen die Zeit" (countdown): every team has the same time account that only runs down while
 * the team itself explains and guesses a card. A team whose account reaches zero is out; the last
 * team left wins. The ranking follows the order in which the teams dropped out.
 */

/** The accounts the player can choose in the setup, in milliseconds (2, 3 or 4 minutes). */
export const countdownBudgetChoices: readonly number[] = [120_000, 180_000, 240_000];
export const defaultCountdownBudgetMs = 120_000;
/** The longest account the logic accepts; the setup offers fewer. */
export const maxCountdownBudgetMs = 3_600_000;

export interface CountdownConfiguration {
  readonly cardLanguage: GameHubLanguage;
  /** The time account every team starts with, in milliseconds. */
  readonly budgetMs: number;
  readonly teams: readonly Team[];
  /**
   * With the automatic change of teams the next team starts at once when a turn ends, with the card
   * that comes with the event (`nextCard`), without an overview in between. Without it (the default)
   * every turn begins with `beginTurn`.
   */
  readonly autoSwitch?: boolean;
}

/** What a team has in the game right now. */
export interface CountdownTeam {
  readonly remainingMs: number;
  /** Each team may skip once in the whole game. */
  readonly skipUsed: boolean;
  /** Cards the team solved; only information, they do not change the ranking. */
  readonly solved: number;
  /** How many turns the team has played; the next turn uses the difficulty of this number. */
  readonly turns: number;
  readonly eliminated: boolean;
}

/** The turn that is going on right now. */
export interface CountdownActive {
  readonly teamIndex: number;
  /** The card on the table; a skipped or wrong card is replaced by one of the same difficulty. */
  readonly card: TabooCard;
}

interface CountdownBase {
  readonly configuration: CountdownConfiguration;
  /** The indexes of the teams in the order in which they dropped out. */
  readonly eliminationOrder: readonly number[];
  /** The index of the team that plays next, or is playing now. */
  readonly teamIndex: number;
  readonly teams: readonly CountdownTeam[];
  /** Every card that was shown so far, so new cards are preferred; a card may be shown again. */
  readonly usedCardIds: readonly string[];
}

export type CountdownState =
  | (CountdownBase & { readonly status: "overview" })
  | (CountdownBase & { readonly status: "running"; readonly active: CountdownActive })
  | (CountdownBase & {
      readonly status: "finished";
      /** The team indexes from first to last place. */
      readonly ranking: readonly number[];
      readonly winnerIds: readonly string[];
    });

export type CountdownEvent =
  /** Starts the turn of the team that is next with its card. */
  | { readonly type: "beginTurn"; readonly card: TabooCard }
  /**
   * The card on the table was solved, skipped (once per team) or had a forbidden word. `elapsedMs` is
   * the clock of the turn at this moment. Skipped and wrong cards need a replacement and the clock
   * runs on; a solved card ends the turn.
   */
  | {
      readonly type: "answerCard";
      readonly outcome: TabooOutcome;
      readonly elapsedMs: number;
      readonly replacement?: TabooCard;
      /** The card for the team that plays next; only used with the automatic change of teams. */
      readonly nextCard?: TabooCard;
    }
  /** The clock of the account reached zero: the team is out. */
  | { readonly type: "timeUp"; readonly nextCard?: TabooCard };

export function createCountdownGame(
  input: CountdownConfiguration,
): ValidationResult<CountdownState> {
  const { teams, issues: teamIssues } = validateTeams(input.teams);
  const issues: ValidationIssue[] = [...teamIssues];
  if (input.cardLanguage !== "de" && input.cardLanguage !== "en") {
    issues.push({ field: "cardLanguage", code: "unsupported_language" });
  }
  if (
    !Number.isSafeInteger(input.budgetMs) ||
    input.budgetMs < 1 ||
    input.budgetMs > maxCountdownBudgetMs
  ) {
    issues.push({ field: "budgetMs", code: "positive_integer_required" });
  }
  if (input.autoSwitch !== undefined && typeof input.autoSwitch !== "boolean") {
    issues.push({ field: "autoSwitch", code: "boolean_required" });
  }
  if (issues.length > 0) return { valid: false, issues };
  return {
    valid: true,
    value: {
      status: "overview",
      configuration: { ...input, teams },
      eliminationOrder: [],
      teamIndex: 0,
      teams: teams.map(() => ({
        remainingMs: input.budgetMs,
        skipUsed: false,
        solved: 0,
        turns: 0,
        eliminated: false,
      })),
      usedCardIds: [],
    },
  };
}

/** The index of the team that plays next, or nothing when the game is over. */
export function getCountdownNextTeam(state: CountdownState): number | undefined {
  return state.status === "finished" ? undefined : state.teamIndex;
}

/** The teams still in the game. */
export function countdownRemainingTeams(state: CountdownState): readonly number[] {
  return state.teams.flatMap((team, index) => (team.eliminated ? [] : [index]));
}

/**
 * The teams from first to last place: the teams still in the game by the most time left, then the
 * teams that dropped out, the last one to drop out first.
 */
export function rankCountdownTeams(state: CountdownState): readonly number[] {
  const inGame = [...countdownRemainingTeams(state)].sort(
    (a, b) => (state.teams[b]?.remainingMs ?? 0) - (state.teams[a]?.remainingMs ?? 0) || a - b,
  );
  return [...inGame, ...[...state.eliminationOrder].reverse()];
}

function validCountdownCard(
  configuration: CountdownConfiguration,
  input: TabooCard,
  taken: ReadonlySet<string>,
): TabooCard | undefined {
  const result = validateCard(input);
  if (
    !result.valid ||
    result.value.language !== configuration.cardLanguage ||
    taken.has(result.value.id)
  ) {
    return undefined;
  }
  return result.value;
}

/** Ends the turn of the running team: the time it used leaves its account. */
function endTurn(
  state: Extract<CountdownState, { status: "running" }>,
  spentMs: number,
  solvedCard: boolean,
): CountdownState {
  const { active, configuration } = state;
  const index = active.teamIndex;
  const before = state.teams[index];
  if (!before) return state;
  const remainingMs = Math.max(0, before.remainingMs - Math.max(0, spentMs));
  const eliminated = remainingMs <= 0;
  const teams = state.teams.map((team, teamIndex) =>
    teamIndex === index
      ? {
          ...team,
          remainingMs,
          eliminated,
          solved: team.solved + (solvedCard && !eliminated ? 1 : 0),
          turns: team.turns + 1,
        }
      : team,
  );
  const eliminationOrder = eliminated ? [...state.eliminationOrder, index] : state.eliminationOrder;
  const base = {
    configuration,
    eliminationOrder,
    teams,
    usedCardIds: state.usedCardIds,
  };
  const left = teams.flatMap((team, teamIndex) => (team.eliminated ? [] : [teamIndex]));
  if (left.length <= 1) {
    const finished = { ...base, teamIndex: index, status: "finished" as const };
    const ranking = rankCountdownTeams({ ...finished, ranking: [], winnerIds: [] });
    const winner = ranking[0] === undefined ? undefined : configuration.teams[ranking[0]];
    return { ...finished, ranking, winnerIds: winner ? [winner.id] : [] };
  }
  // The next team that is still in the game, in the order of the teams.
  let next = index;
  do {
    next = (next + 1) % teams.length;
  } while (teams[next]?.eliminated);
  return { ...base, status: "overview", teamIndex: next };
}

/**
 * With the automatic change of teams the next turn starts at once with the given card; without it,
 * or without a valid card, the game waits in the overview.
 */
function continueAutomatically(state: CountdownState, nextCard: TabooCard | undefined) {
  if (state.status !== "overview" || state.configuration.autoSwitch !== true || !nextCard) {
    return state;
  }
  return transitionCountdown(state, { type: "beginTurn", card: nextCard });
}

export function transitionCountdown(state: CountdownState, event: CountdownEvent): CountdownState {
  const { configuration } = state;

  if (event.type === "beginTurn") {
    if (state.status !== "overview") return state;
    const card = validCountdownCard(configuration, event.card, new Set());
    if (!card) return state;
    return {
      ...state,
      status: "running",
      usedCardIds: [...state.usedCardIds, card.id],
      active: { teamIndex: state.teamIndex, card },
    };
  }

  if (state.status !== "running") return state;
  const { active } = state;
  const team = state.teams[active.teamIndex];
  if (!team) return state;

  if (event.type === "timeUp") {
    return continueAutomatically(endTurn(state, team.remainingMs, false), event.nextCard);
  }

  // A broken clock value must never reach the accounts.
  if (!Number.isFinite(event.elapsedMs) || event.elapsedMs < 0) return state;
  // An account that is used up ends the turn whatever button was pressed.
  if (event.elapsedMs >= team.remainingMs) {
    return continueAutomatically(endTurn(state, team.remainingMs, false), event.nextCard);
  }

  if (event.outcome === "correct") {
    return continueAutomatically(endTurn(state, event.elapsedMs, true), event.nextCard);
  }

  // A skip is allowed once per team and a forbidden word is simply wrong; both get a new card of
  // the same difficulty and the clock keeps running.
  const skipping = event.outcome === "skipped";
  if ((skipping && team.skipUsed) || !event.replacement) return state;
  // A game can last longer than the cards: a card may come back, only not right after itself.
  const replacement = validCountdownCard(
    configuration,
    event.replacement,
    new Set([active.card.id]),
  );
  if (replacement?.difficulty !== active.card.difficulty) return state;
  return {
    ...state,
    usedCardIds: [...state.usedCardIds, replacement.id],
    teams: state.teams.map((candidate, index) =>
      index === active.teamIndex && skipping ? { ...candidate, skipUsed: true } : candidate,
    ),
    active: { ...active, card: replacement },
  };
}

/**
 * The team that plays after the team on the move: the next team in the order that is still in the game.
 * It is the same whether the running team survives its turn or runs out of time, so a caller can
 * pick the next card before the turn ends. Nothing when no other team is left.
 */
export function countdownTeamAfter(state: CountdownState): number | undefined {
  if (state.status === "finished") return undefined;
  const count = state.teams.length;
  for (let step = 1; step < count; step += 1) {
    const index = (state.teamIndex + step) % count;
    if (!state.teams[index]?.eliminated) return index;
  }
  return undefined;
}
