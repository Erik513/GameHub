import type { GameHubLanguage } from "../../settings/languageSettings";

/**
 * The memory for the cards that were played, so a new game prefers cards the players have not seen
 * yet. The business logic only knows this port; the browser's storage is behind it.
 */
export interface PlayedCardsStore {
  /** The ids of the remembered cards of a card language, the oldest first. */
  read(language: GameHubLanguage): readonly string[];
  write(language: GameHubLanguage, ids: readonly string[]): void;
}

/** The most cards that are remembered per language; the oldest are forgotten first. */
export const maxRememberedCards = 5000;

/** Adds the ids of cards that were played to the remembered ones; every card is there once. */
export function rememberCards(
  remembered: readonly string[],
  played: readonly string[],
  limit: number = maxRememberedCards,
): readonly string[] {
  const known = new Set(remembered);
  const added: string[] = [];
  for (const id of played) {
    if (known.has(id)) continue;
    known.add(id);
    added.push(id);
  }
  if (added.length === 0) return remembered;
  const all = [...remembered, ...added];
  return all.length > limit ? all.slice(all.length - limit) : all;
}

/** Removes the given ids from the remembered ones. */
export function forgetCards(
  remembered: readonly string[],
  ids: readonly string[],
): readonly string[] {
  const forgotten = new Set(ids);
  return remembered.filter((id) => !forgotten.has(id));
}

/** The cards for a game: only unplayed ones when they are enough, otherwise all cards again. */
export interface FreshDeck<T extends { readonly id: string }> {
  readonly cards: readonly T[];
  /** True when the unplayed cards were not enough, so the played cards count as new again. */
  readonly restarted: boolean;
}

/**
 * Takes the cards that were not played yet. When they are not enough for the game (`enough` says
 * so), all cards are taken and the game starts a new round of the cards: the caller forgets the
 * remembered ones. A game never fails because of the memory.
 */
export function freshDeck<T extends { readonly id: string }>(
  deck: readonly T[],
  remembered: readonly string[],
  enough: (cards: readonly T[]) => boolean,
): FreshDeck<T> {
  const played = new Set(remembered);
  const fresh = deck.filter((card) => !played.has(card.id));
  if (fresh.length === deck.length) return { cards: deck, restarted: false };
  if (enough(fresh)) return { cards: fresh, restarted: false };
  return { cards: deck, restarted: true };
}
