import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createLocalStorageLanguagePreferenceStore,
  languagePreferenceStorageKey,
} from "./localStorageLanguagePreferenceStore";

describe("local storage language preference store", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists and restores the selected language", () => {
    const store = createLocalStorageLanguagePreferenceStore(localStorage);

    store.write("de");

    expect(localStorage.getItem(languagePreferenceStorageKey)).toBe("de");
    expect(store.read()).toBe("de");
  });

  it("continues safely when storage access fails", () => {
    const unavailableStorage = {
      getItem: vi.fn(() => {
        throw new Error("Storage unavailable");
      }),
      setItem: vi.fn(() => {
        throw new Error("Storage unavailable");
      }),
    } as unknown as Storage;
    const store = createLocalStorageLanguagePreferenceStore(unavailableStorage);

    expect(store.read()).toBeNull();
    expect(() => store.write("en")).not.toThrow();
  });
});
