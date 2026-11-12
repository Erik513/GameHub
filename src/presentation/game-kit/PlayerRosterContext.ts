import { createContext, useContext } from "react";
import type { AddPlayerResult } from "../../business/shared/playerRoster";

/** The saved players of all games and the ways to change them. */
export interface PlayerRosterValue {
  readonly add: (name: string) => AddPlayerResult;
  readonly players: readonly string[];
  readonly remove: (name: string) => void;
}

export const PlayerRosterContext = createContext<PlayerRosterValue | undefined>(undefined);

/** The shared player list, or nothing when the app has none (for example in tests). */
export function usePlayerRoster(): PlayerRosterValue | undefined {
  return useContext(PlayerRosterContext);
}
