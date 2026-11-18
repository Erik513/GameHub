import type { GameHubLanguage } from "../../settings/languageSettings";
import { validateCard, type TabooCard } from "./model";
import { reviseOutcome, type TabooOutcome, type TabooResult } from "./outcome";

/**
 * The tiebreak that decides a tie, for every game mode: the tied teams explain three cards one after
 * another as fast as possible; the most cards in the shortest time win. The rules live here once; the
 * mode only says who is tied and keeps the state that this file hands back.
 */

export const TIEBREAK_CARD_COUNT = 3;
export const TIEBREAK_LIMIT_SECONDS = 90;
/** A tiebreak is played by every tied team, from two up to all teams (decision of 2026-11-18). */
export const TIEBREAK_MIN_TEAMS = 2;

export interface TiebreakAttempt {
  readonly teamIndex: number;
  readonly solved: number;
  /** Elapsed time including penalties, in milliseconds. */
  readonly timeMs: number;
  /** Every card of the attempt with its outcome, so a mistake can be corrected afterwards. */
  readonly results: readonly TabooResult[];
}

export interface TiebreakActive {
  readonly teamIndex: number;
  readonly cards: readonly TabooCard[];
  readonly index: number;
  readonly solved: number;
  readonly skipUsed: boolean;
  /** Cards that were replaced because a forbidden word was said; they only cost time. */
  readonly wrong: number;
  /** The cards that are done so far with their outcome. */
  readonly results: readonly TabooResult[];
}

export type TiebreakEvent =
  | { readonly type: "beginTiebreakAttempt"; readonly cards: readonly TabooCard[] }
  | {
      readonly type: "answerTiebreak";
      readonly outcome: TabooOutcome;
      readonly elapsedMs: number;
      readonly replacement?: TabooCard;
    }
  | { readonly type: "endTiebreakAttempt"; readonly elapsedMs: number }
  /**
   * Corrects the outcome of one card of a finished tiebreak attempt, for example "correct" that
   * had a forbidden word. The ranking and the winners are calculated again.
   */
  | {
      readonly type: "reviseTiebreakResult";
      readonly teamIndex: number;
      readonly cardId: string;
      readonly outcome: TabooOutcome;
    };

/** What a tiebreak keeps while it runs; a game mode holds it in its own state. */
export interface TiebreakPart {
  /** Team indexes of the tied teams in playing order. */
  readonly contenders: readonly number[];
  readonly attempts: readonly TiebreakAttempt[];
  /** Every card that was shown in the tiebreak, so no card comes back. */
  readonly usedCardIds: readonly string[];
  readonly active?: TiebreakActive;
}

/** What the tiebreak needs to know about the game it belongs to. */
export interface TiebreakContext {
  readonly cardLanguage: GameHubLanguage;
  readonly teams: readonly { readonly id: string }[];
}

/**
 * Whether `leaders` tied teams are played off in a tiebreak (and not just share the win): two or
 * more teams, however many. A game with the tiebreak switched off lets them share the win.
 */
export function isTiebreakTie(leaders: number): boolean {
  return leaders >= TIEBREAK_MIN_TEAMS;
}

/** Most cards first, then the shortest time; equal results share the win. */
export function tiebreakWinnerIds(
  teams: TiebreakContext["teams"],
  attempts: readonly TiebreakAttempt[],
): string[] {
  // Times count in tenths of a second, as they are shown: the same tenth is a tie.
  const tenths = (timeMs: number) => Math.round(timeMs / 100);
  const ranked = [...attempts].sort(
    (a, b) => b.solved - a.solved || tenths(a.timeMs) - tenths(b.timeMs),
  );
  const best = ranked[0];
  return ranked
    .filter(
      (attempt) =>
        attempt.solved === best?.solved && tenths(attempt.timeMs) === tenths(best.timeMs),
    )
    .flatMap((attempt) => {
      const team = teams[attempt.teamIndex];
      return team ? [team.id] : [];
    });
}

/** Applies a correction to the attempts; nothing changes for a card that cannot be corrected. */
export function reviseTiebreakAttempts(
  attempts: readonly TiebreakAttempt[],
  event: Extract<TiebreakEvent, { type: "reviseTiebreakResult" }>,
): readonly TiebreakAttempt[] | undefined {
  const attempt = attempts.find((candidate) => candidate.teamIndex === event.teamIndex);
  const previous = attempt?.results.find((result) => result.card.id === event.cardId);
  // Skipped cards are not part of the scoring; a card marked wrong cannot become correct.
  const revised = previous ? reviseOutcome(previous, event.outcome) : undefined;
  if (!attempt || !previous || !revised) return undefined;
  const results = attempt.results.map((result) => (result === previous ? revised : result));
  const solved = results.filter((result) => result.outcome === "correct").length;
  // A forbidden card was replaced, so it can only count when the attempt has room for it.
  if (solved > TIEBREAK_CARD_COUNT) return undefined;
  return attempts.map((candidate) =>
    candidate === attempt ? { ...candidate, results, solved } : candidate,
  );
}

function validTiebreakCard(
  context: TiebreakContext,
  input: TabooCard,
  taken: ReadonlySet<string>,
): TabooCard | undefined {
  const result = validateCard(input);
  if (!result.valid || result.value.language !== context.cardLanguage || taken.has(result.value.id))
    return undefined;
  return result.value;
}

/** The result of an event in a tiebreak that is going on. */
export type TiebreakStep =
  | { readonly part: TiebreakPart }
  | { readonly attempts: readonly TiebreakAttempt[]; readonly winnerIds: string[] };

function finishAttempt(
  context: TiebreakContext,
  part: TiebreakPart,
  active: TiebreakActive,
  elapsedMs: number,
): TiebreakStep {
  const attempts = [
    ...part.attempts,
    {
      teamIndex: active.teamIndex,
      solved: active.solved,
      timeMs: Math.max(0, elapsedMs),
      results: active.results,
    },
  ];
  if (attempts.length < part.contenders.length) {
    return { part: { contenders: part.contenders, attempts, usedCardIds: part.usedCardIds } };
  }
  return { attempts, winnerIds: tiebreakWinnerIds(context.teams, attempts) };
}

/**
 * Applies a start, an answer or the end of an attempt to a tiebreak that is going on. Nothing comes
 * back when the event does not fit (the caller keeps its state then). A correction is not a step of
 * the running tiebreak: see `reviseTiebreakAttempts`.
 */
export function stepTiebreak(
  context: TiebreakContext,
  part: TiebreakPart,
  event: Exclude<TiebreakEvent, { type: "reviseTiebreakResult" }>,
): TiebreakStep | undefined {
  const { active } = part;
  if (event.type === "beginTiebreakAttempt") {
    const teamIndex = part.contenders[part.attempts.length];
    if (active || teamIndex === undefined || event.cards.length !== TIEBREAK_CARD_COUNT)
      return undefined;
    const taken = new Set(part.usedCardIds);
    const cards: TabooCard[] = [];
    for (const input of event.cards) {
      const card = validTiebreakCard(context, input, taken);
      if (!card) return undefined;
      taken.add(card.id);
      cards.push(card);
    }
    return {
      part: {
        ...part,
        usedCardIds: [...part.usedCardIds, ...cards.map((card) => card.id)],
        active: { teamIndex, cards, index: 0, solved: 0, skipUsed: false, wrong: 0, results: [] },
      },
    };
  }
  if (!active) return undefined;
  // A broken clock value must never reach the ranking.
  if (!Number.isFinite(event.elapsedMs)) return undefined;
  if (event.type === "endTiebreakAttempt") {
    return finishAttempt(context, part, active, event.elapsedMs);
  }
  if (event.outcome === "forbiddenWord" || event.outcome === "skipped") {
    const skipping = event.outcome === "skipped";
    // A skip is limited to once; a forbidden word is simply wrong and always gets a new card.
    if ((skipping && active.skipUsed) || !event.replacement) return undefined;
    const replacement = validTiebreakCard(context, event.replacement, new Set(part.usedCardIds));
    if (!replacement) return undefined;
    const shown = active.cards[active.index];
    return {
      part: {
        ...part,
        usedCardIds: [...part.usedCardIds, replacement.id],
        active: {
          ...active,
          results: shown
            ? [...active.results, { card: shown, outcome: event.outcome }]
            : active.results,
          skipUsed: active.skipUsed || skipping,
          wrong: active.wrong + (skipping ? 0 : 1),
          cards: active.cards.map((card, index) => (index === active.index ? replacement : card)),
        },
      },
    };
  }
  const solved = active.solved + 1;
  const shown = active.cards[active.index];
  const results = shown
    ? [...active.results, { card: shown, outcome: "correct" as const }]
    : active.results;
  if (solved >= TIEBREAK_CARD_COUNT) {
    return finishAttempt(context, part, { ...active, solved, results }, event.elapsedMs);
  }
  return { part: { ...part, active: { ...active, solved, results, index: active.index + 1 } } };
}
