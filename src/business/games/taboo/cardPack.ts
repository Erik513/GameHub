import { selectNewTabooCards } from "./cardExchange";
import type { TabooCategoryInfo } from "./categories";
import { normalizeText, validateCard, type TabooCard } from "./model";

/**
 * A card pack is the data file of one language that ships with the app: the categories with their
 * names and the cards. Cards do not repeat the language, it belongs to the whole pack.
 */
export interface TabooCardPack {
  readonly categories: readonly TabooCategoryInfo[];
  readonly cards: readonly TabooCard[];
  readonly language: TabooCard["language"];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fail(message: string): never {
  throw new TypeError(`Invalid Taboo card pack: ${message}`);
}

/**
 * Checks untrusted pack data and returns it as a typed pack. Anything wrong rejects the whole pack
 * with a `TypeError`, so a damaged file never leads to a half loaded card set.
 */
export function parseTabooCardPack(input: unknown): TabooCardPack {
  if (!isRecord(input) || input.format !== "gamehub-taboo-pack" || input.version !== 1) {
    fail("unsupported format");
  }
  const { language } = input;
  if (language !== "de" && language !== "en") fail("unsupported language");
  if (!Array.isArray(input.categories) || !Array.isArray(input.cards)) fail("missing lists");

  const categories: TabooCategoryInfo[] = [];
  const categoryIds = new Set<string>();
  for (const item of input.categories as unknown[]) {
    if (!isRecord(item) || !isRecord(item.names)) fail("category");
    const id = typeof item.id === "string" ? normalizeText(item.id) : "";
    const { de, en } = item.names;
    if (!id || categoryIds.has(id)) fail("category id");
    if (typeof de !== "string" || typeof en !== "string") fail("category names");
    const names = { de: normalizeText(de), en: normalizeText(en) };
    if (!names.de || !names.en) fail("category names");
    categoryIds.add(id);
    categories.push({ id, names });
  }

  const cards: TabooCard[] = [];
  const ids = new Set<string>();
  const terms = new Set<string>();
  for (const item of input.cards as unknown[]) {
    if (!isRecord(item) || !Array.isArray(item.forbiddenWords)) fail("card");
    const { id, term, categoryId, difficulty } = item;
    if (
      typeof id !== "string" ||
      typeof term !== "string" ||
      typeof categoryId !== "string" ||
      (difficulty !== "easy" && difficulty !== "medium" && difficulty !== "hard") ||
      !(item.forbiddenWords as unknown[]).every((word) => typeof word === "string")
    ) {
      fail("card fields");
    }
    const result = validateCard({
      id,
      language,
      term,
      forbiddenWords: item.forbiddenWords as string[],
      categoryId,
      difficulty,
    });
    if (!result.valid) fail(`card "${term}"`);
    const card = result.value;
    const termKey = card.term.toLowerCase();
    if (!categoryIds.has(card.categoryId)) fail(`unknown category of "${term}"`);
    if (ids.has(card.id) || terms.has(termKey)) fail(`duplicate card "${term}"`);
    ids.add(card.id);
    terms.add(termKey);
    cards.push(card);
  }
  return { categories, cards, language };
}

/** Adds the cards of a pack to the built-in cards without repeating ids or terms. */
export function mergeStandardCards(
  base: readonly TabooCard[],
  extra: readonly TabooCard[],
): readonly TabooCard[] {
  return extra.length === 0 ? base : [...base, ...selectNewTabooCards(extra, base)];
}
