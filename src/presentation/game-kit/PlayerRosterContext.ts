import { createContext, useContext } from "react";
import type {
  AddGroupResult,
  AddMemberResult,
  PlayerGroup,
} from "../../business/shared/playerGroups";

/**
 * The saved groups with their players, shared by all games, and the ways to change them. Players only
 * exist inside groups: they are added to a group and removed from it.
 */
export interface PlayerRosterValue {
  readonly addGroup: (name: string) => AddGroupResult;
  readonly addPlayerToGroup: (groupName: string, name: string) => AddMemberResult;
  readonly groups: readonly PlayerGroup[];
  /** All saved players (everyone is in at least one group). */
  readonly players: readonly string[];
  readonly removeGroup: (name: string) => void;
  readonly removePlayerFromGroup: (groupName: string, player: string) => void;
}

export const PlayerRosterContext = createContext<PlayerRosterValue | undefined>(undefined);

/** The shared player list, or nothing when the app has none (for example in tests). */
export function usePlayerRoster(): PlayerRosterValue | undefined {
  return useContext(PlayerRosterContext);
}
