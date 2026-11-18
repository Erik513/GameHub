import { parseSavedGroups, type PlayerGroupStore } from "../business/shared/playerGroups";
import type { PlayerRosterStore } from "../business/shared/playerRoster";

export const playerGroupStorageKey = "gamehub.playerGroups";

/**
 * Keeps the groups of the player list in the browser's local storage. Members that are not in the
 * player list (anymore) are dropped when reading.
 */
export function createLocalStoragePlayerGroupStore(
  storage: Storage,
  rosterStore: PlayerRosterStore,
): PlayerGroupStore {
  return {
    read() {
      try {
        const text = storage.getItem(playerGroupStorageKey);
        return text === null ? [] : parseSavedGroups(JSON.parse(text), rosterStore.read());
      } catch {
        return [];
      }
    },
    write(groups) {
      try {
        storage.setItem(playerGroupStorageKey, JSON.stringify(groups));
      } catch {
        // Without storage the groups work until the page is closed.
      }
    },
  };
}
