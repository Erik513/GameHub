import type { ReactNode } from "react";
import type { PlayedCardsStore } from "../../business/games/taboo/playedCards";
import { PlayedCardsContext } from "./usePlayedCards";

/** Gives Taboo the memory for the cards that were played, or nothing when the app has none. */
export function PlayedCardsProvider({
  children,
  store,
}: {
  readonly children: ReactNode;
  readonly store: PlayedCardsStore | undefined;
}) {
  return <PlayedCardsContext.Provider value={store}>{children}</PlayedCardsContext.Provider>;
}
