import { describe, expect, it } from "vitest";
import type { PlayerRosterStore } from "../business/shared/playerRoster";
import {
  createLocalStoragePlayerGroupStore,
  playerGroupStorageKey,
} from "./localStoragePlayerGroupStore";

const rosterStore: PlayerRosterStore = { read: () => ["Anna", "Ben"], write: () => undefined };

describe("createLocalStoragePlayerGroupStore", () => {
  it("saves groups and reads them back without members that left the player list", () => {
    const store = createLocalStoragePlayerGroupStore(window.localStorage, rosterStore);
    store.write([{ name: "Family", members: ["Anna", "Gone"] }]);
    expect(store.read()).toEqual([{ name: "Family", members: ["Anna"] }]);
    window.localStorage.removeItem(playerGroupStorageKey);
  });

  it("reads nothing when nothing is saved or the data is unusable", () => {
    const store = createLocalStoragePlayerGroupStore(window.localStorage, rosterStore);
    expect(store.read()).toEqual([]);
    window.localStorage.setItem(playerGroupStorageKey, "{not json");
    expect(store.read()).toEqual([]);
    window.localStorage.removeItem(playerGroupStorageKey);
  });

  it("keeps working when the storage fails", () => {
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    } as unknown as Storage;
    const store = createLocalStoragePlayerGroupStore(broken, rosterStore);
    expect(store.read()).toEqual([]);
    expect(() => store.write([])).not.toThrow();
  });
});
