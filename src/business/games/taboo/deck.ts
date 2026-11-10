import { validateCard, type Difficulty, type TabooCard } from "./model";

export interface DeckCriteria {
  readonly language: TabooCard["language"];
  readonly categoryIds?: readonly string[];
  readonly difficulties?: readonly Difficulty[];
  readonly excludedCardIds?: readonly string[];
  readonly minimumCards: number;
}

export type DeckResult =
  | { readonly status: "empty"; readonly cards: readonly [] }
  | { readonly status: "insufficient" | "ready"; readonly cards: readonly TabooCard[] };

export function buildDeck(
  cards: readonly TabooCard[],
  criteria: DeckCriteria,
  random: () => number,
): DeckResult {
  if (!Number.isSafeInteger(criteria.minimumCards) || criteria.minimumCards < 1) {
    throw new RangeError("The deck minimum must be a positive safe integer.");
  }

  const seen = new Set(criteria.excludedCardIds);
  const deck: TabooCard[] = [];
  for (const input of cards) {
    const result = validateCard(input);
    if (!result.valid) continue;
    const card = result.value;
    if (card.language !== criteria.language || seen.has(card.id)) continue;
    if (criteria.categoryIds?.length && !criteria.categoryIds.includes(card.categoryId)) continue;
    if (criteria.difficulties?.length && !criteria.difficulties.includes(card.difficulty)) continue;
    seen.add(card.id);
    deck.push(card);
  }

  if (deck.length === 0) return { status: "empty", cards: [] };
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const sample = random();
    if (!Number.isFinite(sample) || sample < 0 || sample >= 1) {
      throw new RangeError("Random values must be in [0, 1).");
    }
    const target = Math.floor(sample * (index + 1));
    [deck[index], deck[target]] = [deck[target]!, deck[index]!];
  }
  return { status: deck.length < criteria.minimumCards ? "insufficient" : "ready", cards: deck };
}
