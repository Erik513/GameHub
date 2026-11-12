import { parseSavedTeamSetup, type TeamSetupMemory } from "../business/shared/savedTeamSetup";

export const teamSetupStorageKey = "gamehub.teamSetup";

/** Remembers the last teams and players in the browser's local storage. */
export function createLocalStorageTeamSetupMemory(storage: Storage): TeamSetupMemory {
  return {
    read() {
      try {
        const text = storage.getItem(teamSetupStorageKey);
        return text === null ? undefined : parseSavedTeamSetup(JSON.parse(text));
      } catch {
        return undefined;
      }
    },
    write(value) {
      try {
        storage.setItem(teamSetupStorageKey, JSON.stringify(value));
      } catch {
        // Without storage the game still works, the group is just not remembered.
      }
    },
  };
}
