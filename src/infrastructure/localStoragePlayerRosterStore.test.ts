import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createLocalStoragePlayerRosterStore,
  playerRosterStorageKey,
} from "./localStoragePlayerRosterStore";

describe("local storage player roster store", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and restores the players", () => {
    const store = createLocalStoragePlayerRosterStore(localStorage);
    expect(store.read()).toEqual([]);
    store.write(["Anna", "Ben"]);
    expect(localStorage.getItem(playerRosterStorageKey)).toBe('["Anna","Ben"]');
    expect(store.read()).toEqual(["Anna", "Ben"]);
  });

  it("ignores unusable stored data", () => {
    const store = createLocalStoragePlayerRosterStore(localStorage);
    localStorage.setItem(playerRosterStorageKey, "{broken");
    expect(store.read()).toEqual([]);
    localStorage.setItem(playerRosterStorageKey, JSON.stringify({ players: ["Anna"] }));
    expect(store.read()).toEqual([]);
  });

  it("keeps working when the storage is not available", () => {
    const broken = {
      getItem: vi.fn(() => {
        throw new Error("blocked");
      }),
      setItem: vi.fn(() => {
        throw new Error("full");
      }),
    } as unknown as Storage;
    const store = createLocalStoragePlayerRosterStore(broken);
    expect(store.read()).toEqual([]);
    expect(() => store.write(["Anna"])).not.toThrow();
  });
});
