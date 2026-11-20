import type { GameSettingsMemory } from "../business/shared/gameSettingsMemory";

export const gameSettingsStoragePrefix = "gamehub.settings.";

/** Remembers the settings of the games in the browser's local storage, one entry per key. */
export function createLocalStorageGameSettingsMemory(storage: Storage): GameSettingsMemory {
  return {
    read(key) {
      try {
        const text = storage.getItem(gameSettingsStoragePrefix + key);
        return text === null ? undefined : (JSON.parse(text) as unknown);
      } catch {
        return undefined;
      }
    },
    write(key, value) {
      try {
        storage.setItem(gameSettingsStoragePrefix + key, JSON.stringify(value));
      } catch {
        // Without storage the game still works, the settings are just not remembered.
      }
    },
  };
}
