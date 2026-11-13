import type { ValidationIssue } from "../../business/games/taboo/model";

/** What is wrong with a card the player typed, so the notification can say it. */
export const cardProblems = [
  "noTerm",
  "wordCount",
  "duplicateWord",
  "sameAsTerm",
  "partOfTerm",
] as const;
export type CardProblem = (typeof cardProblems)[number];

export function isCardProblem(value: string): value is CardProblem {
  return (cardProblems as readonly string[]).includes(value);
}

/**
 * The first problem of a card in a fixed order: term, number of words, repeated word, word equal
 * to the term, word that is part of the term. Without a known problem there is no result.
 */
export function cardProblem(issues: readonly ValidationIssue[]): CardProblem | undefined {
  const has = (field: string, code: string) =>
    issues.some((issue) => issue.field === field && issue.code === code);
  if (has("term", "required")) return "noTerm";
  if (has("forbiddenWords", "exactly_four")) return "wordCount";
  if (has("forbiddenWords", "duplicate")) return "duplicateWord";
  if (has("forbiddenWords", "matches_term")) return "sameAsTerm";
  if (has("forbiddenWords", "part_of_term")) return "partOfTerm";
  return undefined;
}

/** The words of an input field: separated by commas or semicolons, empty entries are ignored. */
export function splitWords(input: string): string[] {
  return input
    .split(/[,;]/u)
    .map((word) => word.trim())
    .filter((word) => word !== "");
}
