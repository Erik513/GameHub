import { beforeEach, describe, expect, it } from "vitest";
import {
  createLocalStoragePlayedCardsStore,
  playedCardsStorageKey,
} from "./localStoragePlayedCardsStore";

beforeEach(() => {
  window.localStorage.clear();
});

describe("the local storage memory for played cards", () => {
  it("is empty at first and keeps one list per card language", () => {
    const store = createLocalStoragePlayedCardsStore(window.localStorage);
    expect(store.read("en")).toEqual([]);
    store.write("en", ["a", "b"]);
    store.write("de", ["c"]);
    expect(store.read("en")).toEqual(["a", "b"]);
    expect(store.read("de")).toEqual(["c"]);
    expect(createLocalStoragePlayedCardsStore(window.localStorage).read("en")).toEqual(["a", "b"]);
  });

  it("ignores stored data that is not a list of texts", () => {
    const store = createLocalStoragePlayedCardsStore(window.localStorage);
    window.localStorage.setItem(playedCardsStorageKey, "not json");
    expect(store.read("en")).toEqual([]);
    window.localStorage.setItem(playedCardsStorageKey, "42");
    expect(store.read("en")).toEqual([]);
    window.localStorage.setItem(
      playedCardsStorageKey,
      JSON.stringify({ en: ["a", 1, null], de: "x" }),
    );
    expect(store.read("en")).toEqual(["a"]);
    expect(store.read("de")).toEqual([]);
  });

  it("does not fail when the storage refuses to write", () => {
    const broken = {
      getItem: () => null,
      setItem: () => {
        throw new Error("full");
      },
    } as unknown as Storage;
    const store = createLocalStoragePlayedCardsStore(broken);
    expect(() => store.write("en", ["a"])).not.toThrow();
    expect(store.read("en")).toEqual([]);
  });
});
