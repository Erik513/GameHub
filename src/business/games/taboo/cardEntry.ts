import { validateCard, type Difficulty, type TabooCard } from "./model";

export interface CardEntryDefaults {
  readonly categoryId: string;
  readonly difficulty: Difficulty;
  readonly language: TabooCard["language"];
}

export interface CardEntryResult {
  readonly cards: readonly TabooCard[];
  /** 1-based numbers of the non-empty lines that could not be turned into a valid card. */
  readonly invalidLines: readonly number[];
}

/**
 * Turns pasted text into cards. Each non-empty line has the form `Term: word1, word2, word3, word4`
 * (commas or semicolons separate the forbidden words). Invalid lines are reported, not dropped
 * silently. `createId` supplies a unique id per card.
 */
export function parseCardEntries(
  text: string,
  defaults: CardEntryDefaults,
  createId: () => string,
): CardEntryResult {
  const cards: TabooCard[] = [];
  const invalidLines: number[] = [];
  text.split(/\r?\n/).forEach((line, index) => {
    if (line.trim() === "") return;
    const separator = line.indexOf(":");
    const words =
      separator < 0
        ? []
        : line
            .slice(separator + 1)
            .split(/[,;]/)
            .map((word) => word.trim());
    const result =
      separator < 0
        ? undefined
        : validateCard({
            id: createId(),
            language: defaults.language,
            term: line.slice(0, separator),
            forbiddenWords: words,
            categoryId: defaults.categoryId,
            difficulty: defaults.difficulty,
          });
    if (result?.valid) cards.push(result.value);
    else invalidLines.push(index + 1);
  });
  return { cards, invalidLines };
}
