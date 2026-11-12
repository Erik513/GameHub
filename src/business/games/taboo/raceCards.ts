import { shuffle } from "../../shared/shuffle";
import type { Difficulty, TabooCard } from "./model";

/** The difficulties in the order the remainder of a split is handed out. */
const orderedDifficulties: readonly Difficulty[] = ["easy", "medium", "hard"];

/** Every team may skip once, so a run needs spare cards of each difficulty it uses. */
const spareCardsPerTeam = 2;

/**
 * How many cards of each difficulty a run of the mode "Auf Zeit" has. The target is shared as
 * equally as possible among the allowed difficulties (the remainder goes to the first ones: easy,
 * then medium) and every team gets exactly this mix, so the times of the teams are comparable.
 */
export function raceDifficultyMix(
  target: number,
  allowed: readonly Difficulty[] = orderedDifficulties,
): Readonly<Record<Difficulty, number>> {
  const used = orderedDifficulties.filter((difficulty) => allowed.includes(difficulty));
  const base = used.length > 0 ? Math.floor(target / used.length) : 0;
  const rest = used.length > 0 ? target % used.length : 0;
  const mix: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
  used.forEach((difficulty, index) => {
    mix[difficulty] = base + (index < rest ? 1 : 0);
  });
  return mix;
}

/**
 * Picks one card of exactly the given difficulty, preferring cards that were never played. There
 * is no fallback to another difficulty: that would make the run of one team easier or harder than
 * the run of the others.
 */
function pickOfDifficulty(
  pool: readonly TabooCard[],
  difficulty: Difficulty,
  excludedIds: ReadonlySet<string>,
  playedIds: ReadonlySet<string>,
  random: () => number,
): TabooCard | undefined {
  const free = pool.filter((card) => card.difficulty === difficulty && !excludedIds.has(card.id));
  const fresh = free.filter((card) => !playedIds.has(card.id));
  const choices = fresh.length > 0 ? fresh : free;
  return choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))];
}

/**
 * Picks the cards of one run: exactly the shared difficulty mix, never repeating a card. Returns
 * nothing when a difficulty has too few cards; the order of the run is shuffled.
 */
export function pickRaceCards(
  pool: readonly TabooCard[],
  target: number,
  excludedIds: ReadonlySet<string>,
  playedIds: ReadonlySet<string>,
  random: () => number = Math.random,
  allowed: readonly Difficulty[] = orderedDifficulties,
): readonly TabooCard[] | undefined {
  const mix = raceDifficultyMix(target, allowed);
  const taken = new Set(excludedIds);
  const cards: TabooCard[] = [];
  for (const difficulty of orderedDifficulties) {
    for (let count = 0; count < mix[difficulty]; count += 1) {
      const card = pickOfDifficulty(pool, difficulty, taken, playedIds, random);
      if (!card) return undefined;
      taken.add(card.id);
      cards.push(card);
    }
  }
  return shuffle(cards, random);
}

/**
 * A new card for a skipped or wrong one, of exactly the same difficulty. Nothing when no card of
 * that difficulty is left; the mix of the run must not change.
 */
export function pickRaceReplacement(
  pool: readonly TabooCard[],
  replaced: TabooCard,
  excludedIds: ReadonlySet<string>,
  playedIds: ReadonlySet<string>,
  random: () => number = Math.random,
): TabooCard | undefined {
  return pickOfDifficulty(pool, replaced.difficulty, excludedIds, playedIds, random);
}

/** A difficulty that has too few cards for a fair game. */
export interface RaceCardShortage {
  readonly available: number;
  readonly difficulty: Difficulty;
  readonly required: number;
}

/**
 * Checks before the game starts whether every team can get the same mix: each used difficulty
 * needs the cards of all runs plus spare cards for skips and wrong cards. Returns the first
 * difficulty that is short, or nothing when the pool is enough.
 */
export function raceCardShortage(
  pool: readonly TabooCard[],
  teamCount: number,
  target: number,
  allowed: readonly Difficulty[] = orderedDifficulties,
): RaceCardShortage | undefined {
  const mix = raceDifficultyMix(target, allowed);
  for (const difficulty of orderedDifficulties) {
    if (mix[difficulty] === 0) continue;
    const required = teamCount * (mix[difficulty] + spareCardsPerTeam);
    const available = pool.filter((card) => card.difficulty === difficulty).length;
    if (available < required) return { available, difficulty, required };
  }
  return undefined;
}
