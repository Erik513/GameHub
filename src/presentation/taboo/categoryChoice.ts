import { capitalizeFirst, type TabooCard } from "../../business/games/taboo/model";
import type { OwnCategory } from "../../business/games/taboo/categories";

/** Select value that reveals the input for a new category name. */
export const newCategoryChoice = "__new__";

/** Select value of an own category; it belongs to one language. */
export function ownChoice(category: OwnCategory): string {
  return `own:${category.language}:${category.id}`;
}

/** Select value of a standard category; only offered to a card that already sits in one. */
export function standardChoice(id: string): string {
  return `standard:${id}`;
}

export interface ResolvedCategory {
  readonly categoryId: string;
  readonly language: TabooCard["language"];
}

/**
 * The category (and so the language) a choice stands for. A new category takes its name from
 * `name` and its language from `newLanguage`; without a name there is no result yet.
 */
export function resolveCategory(
  choice: string,
  name: string,
  newLanguage: TabooCard["language"],
): ResolvedCategory | undefined {
  if (choice === newCategoryChoice) {
    // The first letter of a new category name is a capital letter, too.
    const categoryId = capitalizeFirst(name, newLanguage);
    return categoryId ? { categoryId, language: newLanguage } : undefined;
  }
  if (choice.startsWith("standard:")) return { categoryId: choice.slice(9), language: newLanguage };
  const own = /^own:(de|en):([\s\S]+)$/u.exec(choice);
  if (own) return { categoryId: own[2]!, language: own[1] === "de" ? "de" : "en" };
  return undefined;
}
