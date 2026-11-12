import { parseSavedRoster, type PlayerRosterStore } from "../business/shared/playerRoster";

export const playerRosterStorageKey = "gamehub.players";

/** Keeps the saved players in the browser's local storage. */
export function createLocalStoragePlayerRosterStore(storage: Storage): PlayerRosterStore {
  return {
    read() {
      try {
        const text = storage.getItem(playerRosterStorageKey);
        return text === null ? [] : parseSavedRoster(JSON.parse(text));
      } catch {
        return [];
      }
    },
    write(names) {
      try {
        storage.setItem(playerRosterStorageKey, JSON.stringify(names));
      } catch {
        // Without storage the list works until the page is closed.
      }
    },
  };
}
