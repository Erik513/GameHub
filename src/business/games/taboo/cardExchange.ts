import { normalizeText, validateCard, type TabooCard } from "./model";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseTabooCardFile(text: string): readonly TabooCard[] {
  const file: unknown = JSON.parse(text);
  if (
    !isRecord(file) ||
    file.format !== "gamehub-taboo-cards" ||
    file.version !== 1 ||
    !Array.isArray(file.cards)
  ) {
    throw new TypeError("Unsupported Taboo card file.");
  }
  return file.cards.map((item: unknown) => {
    if (!isRecord(item)) throw new TypeError("Invalid Taboo card.");
    const { id, language, term, forbiddenWords, categoryId, difficulty } = item;
    if (
      typeof id !== "string" ||
      (language !== "de" && language !== "en") ||
      typeof term !== "string" ||
      !Array.isArray(forbiddenWords) ||
      !forbiddenWords.every((word): word is string => typeof word === "string") ||
      typeof categoryId !== "string" ||
      (difficulty !== "easy" && difficulty !== "medium" && difficulty !== "hard")
    )
      throw new TypeError("Invalid Taboo card.");
    const result = validateCard({ id, language, term, forbiddenWords, categoryId, difficulty });
    if (!result.valid) throw new TypeError("Invalid Taboo card.");
    return result.value;
  });
}

export function serializeTabooCards(cards: readonly TabooCard[]): string {
  return JSON.stringify({ format: "gamehub-taboo-cards", version: 1, cards }, null, 2);
}

export function selectNewTabooCards(
  incoming: readonly TabooCard[],
  existing: readonly TabooCard[],
): readonly TabooCard[] {
  const ids = new Set<string>();
  const terms = new Set<string>();
  function remember(card: TabooCard): boolean {
    const term = `${card.language}:${normalizeText(card.term).toLowerCase()}`;
    if (ids.has(card.id) || terms.has(term)) return false;
    ids.add(card.id);
    terms.add(term);
    return true;
  }
  for (const card of existing) {
    ids.add(card.id);
    terms.add(`${card.language}:${normalizeText(card.term).toLowerCase()}`);
  }
  return incoming.filter(remember);
}
