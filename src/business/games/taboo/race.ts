import type { GameHubLanguage } from "../../settings/languageSettings";
import {
  validateCard,
  validateTeams,
  type Team,
  type TabooCard,
  type ValidationIssue,
  type ValidationResult,
} from "./model";
import { reviseOutcome, type TabooOutcome, type TabooResult } from "./stateMachine";

/**
 * Mode "Auf Zeit" (race): in every round each team plays one run in which it has to solve the same
 * number of cards. The times of all runs of a team add up; the shortest total time wins.
 */

/** The target numbers the player can choose in the setup. */
export const raceTargetChoices: readonly number[] = [5, 10, 15];
export const defaultRaceTarget = 5;
/** The numbers of rounds the player can choose in the setup. */
export const raceRoundChoices: readonly number[] = [1, 2, 3, 4, 5];
export const defaultRaceRounds = 3;
/** The most cards a run can have; the setup offers fewer, this guards the logic. */
export const maxRaceTarget = 50;
/** The most rounds a game can have; the setup offers 1 to 5, this guards the logic. */
export const maxRaceRounds = 99;

export interface RaceConfiguration {
  readonly cardLanguage: GameHubLanguage;
  /** How many cards every team has to solve in each of its runs. */
  readonly target: number;
  /** Rounds in which every team plays one run; without it the game has one round. */
  readonly rounds?: number;
  readonly teams: readonly Team[];
}

/** The number of rounds of a game; one when nothing was set. */
export function raceRounds(configuration: RaceConfiguration): number {
  return configuration.rounds ?? 1;
}

/** A finished run of one team. */
export interface RaceAttempt {
  readonly teamIndex: number;
  /** The round of the run, counted from 1. */
  readonly round: number;
  /** Cards that were replaced because a forbidden word was said; they only cost time. */
  readonly wrong: number;
  readonly skipUsed: boolean;
  /** Time from the start of the run to the last solved card, in milliseconds. */
  readonly timeMs: number;
  /** Cards that counted as solved; fewer than the target after a correction. */
  readonly solved: number;
  /** Every card of the run with its outcome, so a mistake can be corrected afterwards. */
  readonly results: readonly TabooResult[];
}

/** The run that is going on right now. */
export interface RaceActive {
  /**
   * The cards of the run in playing order, from easy to hard; a skipped or wrong card is replaced
   * in place by a card of the same difficulty, so the order stays.
   */
  readonly cards: readonly TabooCard[];
  /** Cards solved so far; `cards[solved]` is the card on the table. */
  readonly solved: number;
  readonly skipUsed: boolean;
  readonly round: number;
  readonly teamIndex: number;
  readonly wrong: number;
  /** The cards that are done so far with their outcome. */
  readonly results: readonly TabooResult[];
}

interface RaceBase {
  readonly attempts: readonly RaceAttempt[];
  readonly configuration: RaceConfiguration;
  /**
   * Every card that was shown in the current round, so no card comes back to another team of the
   * same round. A new round starts with an empty list; cards of earlier rounds may be used again
   * when the pool has no unplayed card left of a difficulty.
   */
  readonly usedCardIds: readonly string[];
}

export type RaceState =
  | (RaceBase & { readonly status: "overview" })
  | (RaceBase & { readonly status: "running"; readonly active: RaceActive })
  | (RaceBase & { readonly status: "finished"; readonly winnerIds: readonly string[] });

export type RaceEvent =
  /** Starts the run of the next team with its cards (exactly `target` cards, easy first). */
  | { readonly type: "beginRun"; readonly cards: readonly TabooCard[] }
  /**
   * The card on the table was solved, skipped (once per run) or had a forbidden word. Skipped and
   * wrong cards need a replacement. `elapsedMs` is the clock of the run at this moment.
   */
  | {
      readonly type: "answerCard";
      readonly outcome: TabooOutcome;
      readonly elapsedMs: number;
      readonly replacement?: TabooCard;
    }
  /** Throws the running run away; the team starts again with new cards. */
  | { readonly type: "restartRun" }
  /**
   * Corrects the outcome of one card of a finished run, for example "correct" that had a forbidden
   * word. The team then has fewer solved cards; the ranking and the winners are calculated again.
   */
  | {
      readonly type: "reviseRunResult";
      readonly teamIndex: number;
      readonly round: number;
      readonly cardId: string;
      readonly outcome: TabooOutcome;
    };

export function createRaceGame(input: RaceConfiguration): ValidationResult<RaceState> {
  const { teams, issues: teamIssues } = validateTeams(input.teams);
  const issues: ValidationIssue[] = [...teamIssues];
  if (input.cardLanguage !== "de" && input.cardLanguage !== "en") {
    issues.push({ field: "cardLanguage", code: "unsupported_language" });
  }
  if (!Number.isSafeInteger(input.target) || input.target < 1 || input.target > maxRaceTarget) {
    issues.push({ field: "target", code: "positive_integer_required" });
  }
  const { rounds } = input;
  if (
    rounds !== undefined &&
    (!Number.isSafeInteger(rounds) || rounds < 1 || rounds > maxRaceRounds)
  ) {
    issues.push({ field: "rounds", code: "positive_integer_required" });
  }
  if (issues.length > 0) return { valid: false, issues };
  return {
    valid: true,
    value: {
      status: "overview",
      configuration: { ...input, teams },
      attempts: [],
      usedCardIds: [],
    },
  };
}

/** Whose run is next and in which round, or nothing when the game is over. */
export function getRaceTurn(
  state: RaceState,
): { readonly round: number; readonly teamIndex: number } | undefined {
  if (state.status === "finished") return undefined;
  if (state.status === "running") {
    return { round: state.active.round, teamIndex: state.active.teamIndex };
  }
  const teams = state.configuration.teams.length;
  const rounds = raceRounds(state.configuration);
  const played = state.attempts.length;
  if (played >= teams * rounds) return undefined;
  return { round: Math.floor(played / teams) + 1, teamIndex: played % teams };
}

/** The index of the team that plays next, or nothing when the game is over. */
export function getRaceNextTeam(state: RaceState): number | undefined {
  return getRaceTurn(state)?.teamIndex;
}

/** Times are compared in tenths of a second; the same tenth is a tie. */
export function raceTimeTenths(timeMs: number): number {
  return Math.round(timeMs / 100);
}

/** What a team has done so far, over all its runs. */
export interface RaceTotal {
  readonly teamIndex: number;
  /** How many runs the team has played. */
  readonly runs: number;
  /** Cards that counted as solved in all runs. */
  readonly solved: number;
  /**
   * The total time in tenths of a second: the sum of the times of the runs, each counted as it is
   * shown (in tenths), so the total always equals the sum of the shown times.
   */
  readonly tenths: number;
}

/** One total per team, in team order; a team without a run has zeros. */
export function raceTotals(
  configuration: RaceConfiguration,
  attempts: readonly RaceAttempt[],
): readonly RaceTotal[] {
  return configuration.teams.map((_, teamIndex) => {
    const own = attempts.filter((attempt) => attempt.teamIndex === teamIndex);
    return {
      teamIndex,
      runs: own.length,
      solved: own.reduce((sum, attempt) => sum + attempt.solved, 0),
      tenths: own.reduce((sum, attempt) => sum + raceTimeTenths(attempt.timeMs), 0),
    };
  });
}

/** The totals ranked: most solved cards first, then the shortest time; equal ones keep the team order. */
export function rankRaceTotals(totals: readonly RaceTotal[]): readonly RaceTotal[] {
  return [...totals].sort(
    (a, b) => b.solved - a.solved || a.tenths - b.tenths || a.teamIndex - b.teamIndex,
  );
}

/**
 * Whether the teams can be ranked against each other: every team has played the same number of
 * runs. In the middle of a round only the teams that already played are comparable.
 */
export function comparableRaceTotals(totals: readonly RaceTotal[]): readonly RaceTotal[] {
  const most = Math.max(0, ...totals.map((total) => total.runs));
  return most === 0 ? [] : totals.filter((total) => total.runs === most);
}

/** The most solved cards win, then the shortest total time; the same result shares the win. */
function raceWinnerIds(
  configuration: RaceConfiguration,
  attempts: readonly RaceAttempt[],
): string[] {
  const totals = comparableRaceTotals(raceTotals(configuration, attempts));
  const best = rankRaceTotals(totals)[0];
  return totals
    .filter((total) => total.solved === best?.solved && total.tenths === best.tenths)
    .flatMap((total) => {
      const team = configuration.teams[total.teamIndex];
      return team ? [team.id] : [];
    });
}

/** Every card that was shown in a finished run or in the current round; used to prefer new cards. */
export function racePlayedCardIds(state: RaceState): ReadonlySet<string> {
  const played = new Set(state.usedCardIds);
  for (const attempt of state.attempts) {
    for (const result of attempt.results) played.add(result.card.id);
  }
  return played;
}

function validRaceCard(
  configuration: RaceConfiguration,
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

function finishRun(state: Extract<RaceState, { status: "running" }>, elapsedMs: number): RaceState {
  const { active, configuration } = state;
  const attempts = [
    ...state.attempts,
    {
      teamIndex: active.teamIndex,
      round: active.round,
      timeMs: Math.max(0, elapsedMs),
      solved: active.solved,
      results: active.results,
      skipUsed: active.skipUsed,
      wrong: active.wrong,
    },
  ];
  const teams = configuration.teams.length;
  const rounds = raceRounds(configuration);
  // A completed round starts the next one with fresh cards for every team.
  const roundDone = attempts.length % teams === 0;
  const base = {
    configuration,
    attempts,
    usedCardIds: roundDone ? [] : state.usedCardIds,
  };
  if (attempts.length < teams * rounds) {
    return { ...base, status: "overview" };
  }
  return { ...base, status: "finished", winnerIds: raceWinnerIds(configuration, attempts) };
}

export function transitionRace(state: RaceState, event: RaceEvent): RaceState {
  const { configuration } = state;

  if (event.type === "reviseRunResult") {
    if (state.status === "running") return state;
    const attempt = state.attempts.find(
      (candidate) => candidate.teamIndex === event.teamIndex && candidate.round === event.round,
    );
    const previous = attempt?.results.find((result) => result.card.id === event.cardId);
    // Skipped cards are not part of the scoring; a card marked wrong cannot become correct.
    const revised = previous ? reviseOutcome(previous, event.outcome) : undefined;
    if (!attempt || !previous || !revised) return state;
    const results = attempt.results.map((result) => (result === previous ? revised : result));
    const solved = results.filter((result) => result.outcome === "correct").length;
    // A forbidden card was replaced, so it can only count when the run has room for it.
    if (solved > configuration.target) return state;
    const attempts = state.attempts.map((candidate) =>
      candidate === attempt ? { ...candidate, results, solved } : candidate,
    );
    return state.status === "finished"
      ? { ...state, attempts, winnerIds: raceWinnerIds(configuration, attempts) }
      : { ...state, attempts };
  }

  if (event.type === "beginRun") {
    const turn = getRaceTurn(state);
    if (state.status !== "overview" || turn === undefined) return state;
    if (event.cards.length !== configuration.target) return state;
    const taken = new Set(state.usedCardIds);
    const cards: TabooCard[] = [];
    for (const input of event.cards) {
      const card = validRaceCard(configuration, input, taken);
      if (!card) return state;
      taken.add(card.id);
      cards.push(card);
    }
    return {
      ...state,
      status: "running",
      usedCardIds: [...state.usedCardIds, ...cards.map((card) => card.id)],
      active: {
        cards,
        solved: 0,
        skipUsed: false,
        round: turn.round,
        teamIndex: turn.teamIndex,
        wrong: 0,
        results: [],
      },
    };
  }

  if (state.status !== "running") return state;
  const { active } = state;

  if (event.type === "restartRun") {
    // The cards of the thrown away run stay used, nothing from it comes back.
    return {
      status: "overview",
      configuration,
      attempts: state.attempts,
      usedCardIds: state.usedCardIds,
    };
  }

  // A broken clock value must never reach the ranking.
  if (!Number.isFinite(event.elapsedMs)) return state;

  const shown = active.cards[active.solved];
  if (event.outcome === "correct") {
    const solved = active.solved + 1;
    const results = shown
      ? [...active.results, { card: shown, outcome: "correct" as const }]
      : active.results;
    if (solved >= configuration.target) {
      return finishRun({ ...state, active: { ...active, solved, results } }, event.elapsedMs);
    }
    return { ...state, active: { ...active, solved, results } };
  }

  // A skip is allowed once per run; a forbidden word is simply wrong. Both get a new card.
  const skipping = event.outcome === "skipped";
  if ((skipping && active.skipUsed) || !event.replacement) return state;
  const replacement = validRaceCard(configuration, event.replacement, new Set(state.usedCardIds));
  if (!replacement) return state;
  return {
    ...state,
    usedCardIds: [...state.usedCardIds, replacement.id],
    active: {
      ...active,
      skipUsed: active.skipUsed || skipping,
      results: shown
        ? [...active.results, { card: shown, outcome: event.outcome }]
        : active.results,
      wrong: active.wrong + (skipping ? 0 : 1),
      cards: active.cards.map((card, index) => (index === active.solved ? replacement : card)),
    },
  };
}
