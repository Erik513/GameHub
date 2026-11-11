import { normalizeText, type TabooCard } from "./model";

/** Categories that ship with the app; their display names are translated by the UI. */
export const builtInCategoryIds = ["everyday", "nature", "culture"] as const;

/**
 * Custom categories have no separate record: a card's `categoryId` is the category name the
 * player typed. This returns the distinct custom names used by cards of one language, sorted.
 */
export function customCategoryIds(
  cards: readonly TabooCard[],
  language: TabooCard["language"],
): string[] {
  const builtIn = new Set<string>(builtInCategoryIds);
  const names = new Map<string, string>();
  for (const card of cards) {
    if (card.language !== language || builtIn.has(card.categoryId)) continue;
    const key = normalizeText(card.categoryId).toLowerCase();
    if (!names.has(key)) names.set(key, card.categoryId);
  }
  return [...names.values()].sort((left, right) => left.localeCompare(right, language));
}
