import type { Difficulty, TabooCard } from "./model";

/** Easy cards come first, hard cards last. */
const difficultyRank: Readonly<Record<Difficulty, number>> = { easy: 0, medium: 1, hard: 2 };

/** Compares two texts for the given language: alphabetical, ignoring case and accents. */
export function compareText(left: string, right: string, language: string): number {
  return left.localeCompare(right, language, { sensitivity: "base", numeric: true });
}

/**
 * Sorts cards for a list: easy to hard, and alphabetically by term within one difficulty. The input
 * is not changed.
 */
export function sortCardsForList(
  cards: readonly TabooCard[],
  language: TabooCard["language"],
): TabooCard[] {
  return [...cards].sort(
    (left, right) =>
      difficultyRank[left.difficulty] - difficultyRank[right.difficulty] ||
      compareText(left.term, right.term, language),
  );
}

/** Sorts items alphabetically by their label, in the given language. The input is not changed. */
export function sortByLabel<T>(
  items: readonly T[],
  label: (item: T) => string,
  language: string,
): T[] {
  return [...items].sort((left, right) => compareText(label(left), label(right), language));
}
