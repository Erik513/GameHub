import { normalizeText, type TabooCard } from "./model";

/** A category that ships with the app. Its names come from the data, not from the UI texts. */
export interface TabooCategoryInfo {
  readonly id: string;
  readonly names: { readonly de: string; readonly en: string };
}

/** The categories of the cards that are built into the app code (the fallback without a pack). */
export const builtInCategories: readonly TabooCategoryInfo[] = [
  { id: "everyday", names: { de: "Alltag", en: "Everyday life" } },
  { id: "nature", names: { de: "Natur", en: "Nature" } },
  { id: "culture", names: { de: "Kultur", en: "Culture" } },
];

export const builtInCategoryIds = builtInCategories.map((category) => category.id);

/** The display name of a category in the given language; unknown ids show as they are. */
export function categoryName(
  infos: readonly TabooCategoryInfo[],
  id: string,
  language: keyof TabooCategoryInfo["names"],
): string {
  return infos.find((info) => info.id === id)?.names[language] ?? id;
}

/** Combines category lists; the first entry of an id wins. */
export function mergeCategoryInfos(
  ...lists: readonly (readonly TabooCategoryInfo[])[]
): TabooCategoryInfo[] {
  const merged = new Map<string, TabooCategoryInfo>();
  for (const info of lists.flat()) if (!merged.has(info.id)) merged.set(info.id, info);
  return [...merged.values()];
}

/**
 * The standard categories to offer for a language: the ones of the built-in cards always, the
 * others of a card pack only once they have at least one card. List order is kept.
 */
export function availableCategories(
  infos: readonly TabooCategoryInfo[],
  cards: readonly TabooCard[],
  language: TabooCard["language"],
): TabooCategoryInfo[] {
  const used = new Set(cards.filter((card) => card.language === language).map((c) => c.categoryId));
  const always = new Set<string>(builtInCategoryIds);
  return infos.filter((info) => always.has(info.id) || used.has(info.id));
}

/**
 * Custom categories have no separate record: a card's `categoryId` is the category name the
 * player typed. This returns the distinct custom names used by cards of one language, sorted.
 * Ids of the standard categories are not custom.
 */
export function customCategoryIds(
  cards: readonly TabooCard[],
  language: TabooCard["language"],
  standardIds: readonly string[] = builtInCategoryIds,
): string[] {
  const standard = new Set<string>(standardIds);
  const names = new Map<string, string>();
  for (const card of cards) {
    if (card.language !== language || standard.has(card.categoryId)) continue;
    const key = normalizeText(card.categoryId).toLowerCase();
    if (!names.has(key)) names.set(key, card.categoryId);
  }
  return [...names.values()].sort((left, right) => left.localeCompare(right, language));
}

/** An own category belongs to one language: the same name in two languages is two categories. */
export interface OwnCategory {
  readonly id: string;
  readonly language: TabooCard["language"];
}

/**
 * The player's own categories of all languages, sorted by name and then by language. Ids of the
 * standard categories are not own categories.
 */
export function ownCategories(
  cards: readonly TabooCard[],
  standardIds: readonly string[] = builtInCategoryIds,
  locale = "en",
): OwnCategory[] {
  const standard = new Set<string>(standardIds);
  const found = new Map<string, OwnCategory>();
  for (const card of cards) {
    if (standard.has(card.categoryId)) continue;
    const key = `${card.language}:${normalizeText(card.categoryId).toLowerCase()}`;
    if (!found.has(key)) found.set(key, { id: card.categoryId, language: card.language });
  }
  return [...found.values()].sort(
    (left, right) =>
      left.id.localeCompare(right.id, locale) || left.language.localeCompare(right.language),
  );
}
