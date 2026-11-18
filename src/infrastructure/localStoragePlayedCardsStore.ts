import type { PlayedCardsStore } from "../business/games/taboo/playedCards";
import type { GameHubLanguage } from "../business/settings/languageSettings";

export const playedCardsStorageKey = "gamehub.taboo.playedCards";

/** Reads the stored lists of every language; anything that is not a list of texts is ignored. */
function readAll(storage: Storage): Partial<Record<GameHubLanguage, readonly string[]>> {
  try {
    const text = storage.getItem(playedCardsStorageKey);
    if (text === null) return {};
    const data: unknown = JSON.parse(text);
    if (typeof data !== "object" || data === null) return {};
    const result: Partial<Record<GameHubLanguage, readonly string[]>> = {};
    for (const language of ["de", "en"] as const) {
      const list = (data as Record<string, unknown>)[language];
      if (Array.isArray(list)) {
        result[language] = list.filter((id): id is string => typeof id === "string");
      }
    }
    return result;
  } catch {
    return {};
  }
}

/** Remembers the played Taboo cards in the browser's local storage, one list per card language. */
export function createLocalStoragePlayedCardsStore(storage: Storage): PlayedCardsStore {
  return {
    read(language) {
      return readAll(storage)[language] ?? [];
    },
    write(language, ids) {
      try {
        storage.setItem(
          playedCardsStorageKey,
          JSON.stringify({ ...readAll(storage), [language]: ids }),
        );
      } catch {
        // Without storage the game still works, the cards are just not remembered.
      }
    },
  };
}
