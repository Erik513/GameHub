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

/** Mode "Auf Zeit" (race): every team solves the same number of cards, the shortest time wins. */

/** The target numbers the player can choose in the setup. */
export const raceTargetChoices: readonly number[] = [5, 10, 15];
export const defaultRaceTarget = 5;
/** The most cards a run can have; the setup offers fewer, this guards the logic. */
export const maxRaceTarget = 50;

export interface RaceConfiguration {
  readonly cardLanguage: GameHubLanguage;
  /** How many cards every team has to solve. */
  readonly target: number;
  readonly teams: readonly Team[];
}

/** A finished run of one team. */
export interface RaceAttempt {
  readonly teamIndex: number;
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
  /** The cards of the run in playing order; a skipped or wrong card is replaced in place. */
  readonly cards: readonly TabooCard[];
  /** Cards solved so far; `cards[solved]` is the card on the table. */
  readonly solved: number;
  readonly skipUsed: boolean;
  readonly teamIndex: number;
  readonly wrong: number;
  /** The cards that are done so far with their outcome. */
  readonly results: readonly TabooResult[];
}

interface RaceBase {
  readonly attempts: readonly RaceAttempt[];
  readonly configuration: RaceConfiguration;
  /** Every card that was shown in this game, so no card comes back. */
  readonly usedCardIds: readonly string[];
}

export type RaceState =
  | (RaceBase & { readonly status: "overview" })
  | (RaceBase & { readonly status: "running"; readonly active: RaceActive })
  | (RaceBase & { readonly status: "finished"; readonly winnerIds: readonly string[] });

export type RaceEvent =
  /** Starts the run of the next team with its cards (exactly `target` cards). */
  | { readonly type: "beginRun"; readonly cards: readonly TabooCard[] }
  /**
   * The card on the table was solved, skipped (once per team) or had a forbidden word. Skipped and
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

/** The index of the team that plays next, or nothing when every team has played. */
export function getRaceNextTeam(state: RaceState): number | undefined {
  if (state.status === "finished") return undefined;
  const next = state.status === "running" ? state.active.teamIndex : state.attempts.length;
  return next < state.configuration.teams.length ? next : undefined;
}

/** Times are compared in tenths of a second; the same tenth is a tie. */
export function raceTimeTenths(timeMs: number): number {
  return Math.round(timeMs / 100);
}

/** The finished runs: most solved cards first, then the fastest; equal ones keep the playing order. */
export function rankRaceAttempts(attempts: readonly RaceAttempt[]): readonly RaceAttempt[] {
  return [...attempts].sort(
    (a, b) =>
      b.solved - a.solved ||
      raceTimeTenths(a.timeMs) - raceTimeTenths(b.timeMs) ||
      a.teamIndex - b.teamIndex,
  );
}

/** The most solved cards win, then the shortest time; the same result shares the win. */
function raceWinnerIds(
  configuration: RaceConfiguration,
  attempts: readonly RaceAttempt[],
): string[] {
  const best = rankRaceAttempts(attempts)[0];
  return attempts
    .filter(
      (attempt) =>
        attempt.solved === best?.solved &&
        raceTimeTenths(attempt.timeMs) === raceTimeTenths(best.timeMs),
    )
    .flatMap((attempt) => {
      const team = configuration.teams[attempt.teamIndex];
      return team ? [team.id] : [];
    });
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
      timeMs: Math.max(0, elapsedMs),
      solved: active.solved,
      results: active.results,
      skipUsed: active.skipUsed,
      wrong: active.wrong,
    },
  ];
  const base = { configuration, attempts, usedCardIds: state.usedCardIds };
  if (attempts.length < configuration.teams.length) return { ...base, status: "overview" };
  return { ...base, status: "finished", winnerIds: raceWinnerIds(configuration, attempts) };
}

export function transitionRace(state: RaceState, event: RaceEvent): RaceState {
  const { configuration } = state;

  if (event.type === "reviseRunResult") {
    if (state.status === "running") return state;
    const attempt = state.attempts.find((candidate) => candidate.teamIndex === event.teamIndex);
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
    const teamIndex = getRaceNextTeam(state);
    if (state.status !== "overview" || teamIndex === undefined) return state;
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
      active: { cards, solved: 0, skipUsed: false, teamIndex, wrong: 0, results: [] },
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

  // A skip is allowed once per team; a forbidden word is simply wrong. Both get a new card.
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
