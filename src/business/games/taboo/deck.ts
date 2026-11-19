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

/**
 * Makes the difficulties of a deck even and lets them alternate, whatever the cards are that are left.
 * `preferred` are the cards to play first (for example the ones that were not played yet); `all` are all
 * matching cards. A difficulty that has fewer preferred cards than the largest one is filled up with
 * cards played before until it is as large (as far as there are cards), so a game with all difficulties
 * is not mostly hard because the easy cards were played already. Every difficulty keeps its preferred
 * cards first. The difficulties take turns in a random order each time round. With only one difficulty
 * the preferred cards are returned as they are.
 */
export function interleaveByDifficulty(
  preferred: readonly TabooCard[],
  all: readonly TabooCard[],
  random: () => number,
): readonly TabooCard[] {
  const difficulties = new Set(all.map((card) => card.difficulty));
  if (difficulties.size <= 1) return preferred;

  const chosen = new Set(preferred.map((card) => card.id));
  const queues = new Map<Difficulty, TabooCard[]>();
  const spare = new Map<Difficulty, TabooCard[]>();
  for (const difficulty of difficulties) {
    queues.set(difficulty, []);
    spare.set(difficulty, []);
  }
  for (const card of preferred) queues.get(card.difficulty)?.push(card);
  for (const card of all) if (!chosen.has(card.id)) spare.get(card.difficulty)?.push(card);
  const target = Math.max(...[...queues.values()].map((queue) => queue.length));
  for (const [difficulty, queue] of queues) {
    queue.push(...(spare.get(difficulty) ?? []).slice(0, Math.max(0, target - queue.length)));
  }

  const result: TabooCard[] = [];
  let open = [...queues.values()].filter((queue) => queue.length > 0);
  while (open.length > 0) {
    // The order of the difficulties is drawn anew for every round of the cards.
    const order = [...open];
    for (let index = order.length - 1; index > 0; index -= 1) {
      const pick = Math.floor(random() * (index + 1));
      [order[index], order[pick]] = [order[pick]!, order[index]!];
    }
    for (const queue of order) {
      const card = queue.shift();
      if (card) result.push(card);
    }
    open = open.filter((queue) => queue.length > 0);
  }
  return result;
}
