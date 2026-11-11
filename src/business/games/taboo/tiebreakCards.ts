import type { Difficulty, TabooCard } from "./model";

export const tiebreakDifficulties: readonly Difficulty[] = ["easy", "medium", "hard"];

/**
 * Picks a card of the wanted difficulty for a tiebreak attempt. Cards that were never played are
 * preferred; if the difficulty is not available at all, any unused card is used instead.
 */
export function pickTiebreakCard(
  pool: readonly TabooCard[],
  difficulty: Difficulty,
  excludedIds: ReadonlySet<string>,
  playedIds: ReadonlySet<string>,
  random: () => number = Math.random,
): TabooCard | undefined {
  const free = pool.filter((card) => !excludedIds.has(card.id));
  const sameDifficulty = free.filter((card) => card.difficulty === difficulty);
  const candidates = sameDifficulty.length > 0 ? sameDifficulty : free;
  const fresh = candidates.filter((card) => !playedIds.has(card.id));
  const choices = fresh.length > 0 ? fresh : candidates;
  return choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))];
}

/** One card per difficulty (easy, medium, hard) so every contender gets a comparable task. */
export function pickTiebreakCards(
  pool: readonly TabooCard[],
  excludedIds: ReadonlySet<string>,
  playedIds: ReadonlySet<string>,
  random: () => number = Math.random,
): readonly TabooCard[] | undefined {
  const taken = new Set(excludedIds);
  const cards: TabooCard[] = [];
  for (const difficulty of tiebreakDifficulties) {
    const card = pickTiebreakCard(pool, difficulty, taken, playedIds, random);
    if (!card) return undefined;
    taken.add(card.id);
    cards.push(card);
  }
  return cards;
}
