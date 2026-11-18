import type { Difficulty, TabooCard } from "./model";

const orderedDifficulties: readonly Difficulty[] = ["easy", "medium", "hard"];

/** Every team may skip once and a forbidden word replaces a card, so a few spare cards are needed. */
const spareCardsPerTeam = 3;

/**
 * The difficulty of the n-th turn of a team (counted from 0). Every team gets the same sequence,
 * easy, medium, hard, easy ..., over the allowed difficulties, so no team has harder cards than
 * another at the same point of the game.
 */
export function countdownDifficultyForTurn(
  turn: number,
  allowed: readonly Difficulty[] = orderedDifficulties,
): Difficulty {
  const used = orderedDifficulties.filter((difficulty) => allowed.includes(difficulty));
  const sequence = used.length > 0 ? used : orderedDifficulties;
  return sequence[turn % sequence.length] ?? "easy";
}

/**
 * Picks one card of exactly the given difficulty that is not excluded, preferring cards that were
 * never played. There is no fallback to another difficulty, so the cards stay comparable.
 */
export function pickCountdownCard(
  pool: readonly TabooCard[],
  difficulty: Difficulty,
  excludedIds: ReadonlySet<string>,
  playedIds: ReadonlySet<string>,
  random: () => number = Math.random,
): TabooCard | undefined {
  const free = pool.filter((card) => card.difficulty === difficulty && !excludedIds.has(card.id));
  const fresh = free.filter((card) => !playedIds.has(card.id));
  const choices = fresh.length > 0 ? fresh : free;
  return choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))];
}

/** A difficulty that has too few cards for a fair game. */
export interface CountdownCardShortage {
  readonly available: number;
  readonly difficulty: Difficulty;
  readonly required: number;
}

/**
 * Checks before the game starts that every used difficulty has enough cards for a team to play
 * a few turns plus spare cards. Returns the first difficulty that is short, or nothing.
 */
export function countdownCardShortage(
  pool: readonly TabooCard[],
  teamCount: number,
  allowed: readonly Difficulty[] = orderedDifficulties,
): CountdownCardShortage | undefined {
  for (const difficulty of orderedDifficulties) {
    if (!allowed.includes(difficulty)) continue;
    const required = teamCount * (1 + spareCardsPerTeam);
    const available = pool.filter((card) => card.difficulty === difficulty).length;
    if (available < required) return { available, difficulty, required };
  }
  return undefined;
}
