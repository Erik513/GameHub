import { createContext, useContext, useMemo, useRef, useState } from "react";
import {
  forgetCards,
  freshDeck,
  rememberCards,
  type PlayedCardsStore,
} from "../../business/games/taboo/playedCards";
import type { GameHubLanguage } from "../../business/settings/languageSettings";

export const PlayedCardsContext = createContext<PlayedCardsStore | undefined>(undefined);

/** What a game does with the played cards of one card language. */
export interface PlayedCards {
  /** Whether the app can remember cards at all (it has a store). */
  readonly available: boolean;
  /** Starts a game: from now on its cards are remembered, or not (the setting). */
  begin: (remember: boolean) => void;
  /** The cards for a game: the unplayed ones when they are enough, else all of them again. */
  choose: <T extends { readonly id: string }>(
    deck: readonly T[],
    enough: (cards: readonly T[]) => boolean,
  ) => readonly T[];
  /** How many cards are remembered. */
  readonly count: number;
  /** Adds cards that were shown in the game; does nothing when the game does not remember. */
  remember: (ids: readonly string[]) => void;
  /** Forgets every remembered card of the card language. */
  reset: () => void;
}

/** The memory for the played cards of a card language, as a game uses it. */
export function usePlayedCards(language: GameHubLanguage): PlayedCards {
  const store = useContext(PlayedCardsContext);
  // Counts the changes, so the number of remembered cards is read again.
  const [version, setVersion] = useState(0);
  // Whether the game that is going on remembers its cards (a setting of the game).
  const remembering = useRef(false);

  return useMemo(() => {
    const count = store ? store.read(language).length : 0;
    // `version` is only there so a change of the memory reads the count again.
    void version;
    return {
      available: store !== undefined,
      begin: (remember: boolean) => {
        remembering.current = remember && store !== undefined;
      },
      choose: (deck, enough) => {
        if (!store || !remembering.current) return deck;
        const remembered = store.read(language);
        const result = freshDeck(deck, remembered, enough);
        // A new round of the cards: the cards of this game are unplayed again.
        if (result.restarted) {
          store.write(
            language,
            forgetCards(
              remembered,
              deck.map((card) => card.id),
            ),
          );
          setVersion((current) => current + 1);
        }
        return result.cards;
      },
      count,
      remember: (ids) => {
        if (!store || !remembering.current) return;
        const remembered = store.read(language);
        const next = rememberCards(remembered, ids);
        if (next === remembered) return;
        store.write(language, next);
        setVersion((current) => current + 1);
      },
      reset: () => {
        store?.write(language, []);
        setVersion((current) => current + 1);
      },
    };
  }, [language, store, version]);
}
