import { shuffle } from "../../shared/shuffle";
import type { Difficulty, TabooCard } from "./model";
import { pickTiebreakCard, tiebreakDifficulties } from "./tiebreakCards";

/**
 * How many cards of each difficulty a run of the mode "Auf Zeit" has. The target is shared as
 * equally as possible (the remainder goes to easy first, then medium) and every team gets the same
 * mix, so the times of the teams are comparable.
 */
export function raceDifficultyMix(target: number): Readonly<Record<Difficulty, number>> {
  const base = Math.floor(target / 3);
  const rest = target % 3;
  return {
    easy: base + (rest > 0 ? 1 : 0),
    medium: base + (rest > 1 ? 1 : 0),
    hard: base,
  };
}

/**
 * Picks the cards of one run: the shared difficulty mix, preferring cards that were never played
 * and never repeating a card. A difficulty with too few cards is filled from the others. Returns
 * nothing when the pool has too few cards; the order of the run is shuffled.
 */
export function pickRaceCards(
  pool: readonly TabooCard[],
  target: number,
  excludedIds: ReadonlySet<string>,
  playedIds: ReadonlySet<string>,
  random: () => number = Math.random,
): readonly TabooCard[] | undefined {
  const mix = raceDifficultyMix(target);
  const taken = new Set(excludedIds);
  const cards: TabooCard[] = [];
  for (const difficulty of tiebreakDifficulties) {
    for (let count = 0; count < mix[difficulty]; count += 1) {
      const card = pickTiebreakCard(pool, difficulty, taken, playedIds, random);
      if (!card) return undefined;
      taken.add(card.id);
      cards.push(card);
    }
  }
  return shuffle(cards, random);
}

/** A new card for a skipped or wrong one, of the same difficulty if the pool allows it. */
export function pickRaceReplacement(
  pool: readonly TabooCard[],
  replaced: TabooCard,
  excludedIds: ReadonlySet<string>,
  playedIds: ReadonlySet<string>,
  random: () => number = Math.random,
): TabooCard | undefined {
  return pickTiebreakCard(pool, replaced.difficulty, excludedIds, playedIds, random);
}
