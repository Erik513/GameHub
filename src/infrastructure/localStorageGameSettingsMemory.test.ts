import { expect, it } from "vitest";
import {
  createLocalStorageGameSettingsMemory,
  gameSettingsStoragePrefix,
} from "./localStorageGameSettingsMemory";

function fakeStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
  return {
    clear: () => data.clear(),
    getItem: (key: string) => data.get(key) ?? null,
    key: (index: number) => [...data.keys()][index] ?? null,
    get length() {
      return data.size;
    },
    removeItem: (key: string) => void data.delete(key),
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

it("writes and reads a value under the key of the game", () => {
  const storage = fakeStorage();
  const memory = createLocalStorageGameSettingsMemory(storage);
  memory.write("werewolf.configuration", { roles: ["witch"] });
  expect(storage.getItem(gameSettingsStoragePrefix + "werewolf.configuration")).toBe(
    '{"roles":["witch"]}',
  );
  expect(memory.read("werewolf.configuration")).toEqual({ roles: ["witch"] });
});

it("reads nothing when there is nothing or the data is broken", () => {
  const memory = createLocalStorageGameSettingsMemory(
    fakeStorage({ [gameSettingsStoragePrefix + "broken"]: "{not json" }),
  );
  expect(memory.read("missing")).toBeUndefined();
  expect(memory.read("broken")).toBeUndefined();
});

it("keeps working when the storage refuses to save", () => {
  const storage = fakeStorage();
  storage.setItem = () => {
    throw new Error("full");
  };
  const memory = createLocalStorageGameSettingsMemory(storage);
  expect(() => memory.write("a", 1)).not.toThrow();
});
