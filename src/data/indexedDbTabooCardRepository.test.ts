import { IDBFactory } from "fake-indexeddb";
import { expect, it, vi } from "vitest";
import type { TabooCard } from "../business/games/taboo/model";
import { IndexedDbTabooCardRepository } from "./indexedDbTabooCardRepository";

const card: TabooCard = {
  id: "moon",
  language: "en",
  term: "Moon",
  forbiddenWords: ["night", "sky", "orbit"],
  categoryId: "nature",
  difficulty: "easy",
};

it("creates the initial schema and reopens saved cards", async () => {
  const factory = new IDBFactory();
  const repository = new IndexedDbTabooCardRepository(factory);
  expect(await repository.list()).toEqual([]);
  await repository.addAll([{ ...card, term: " Moon " }]);
  expect(await new IndexedDbTabooCardRepository(factory).list()).toEqual([card]);
  expect(await factory.databases()).toEqual([{ name: "gamehub", version: 1 }]);
});

it("rolls back a whole batch on a duplicate ID and preserves existing cards", async () => {
  const repository = new IndexedDbTabooCardRepository(new IDBFactory());
  await repository.addAll([card]);
  await expect(repository.addAll([{ ...card, id: "new" }, card])).rejects.toMatchObject({
    cause: { name: "ConstraintError" },
  });
  expect(await repository.list()).toEqual([card]);
});

it("aborts queued writes when a card cannot be cloned", async () => {
  const repository = new IndexedDbTabooCardRepository(new IDBFactory());
  const uncloneable = { ...card, id: "bad", extra: () => undefined };
  await expect(repository.addAll([card, uncloneable])).rejects.toMatchObject({
    cause: { name: "DataCloneError" },
  });
  expect(await repository.list()).toEqual([]);
});

it("reports a newer database schema without downgrading it", async () => {
  const factory = new IDBFactory();
  const request = factory.open("gamehub", 2);
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Test database failed.", { cause: request.error }));
  });
  database.close();
  vi.stubGlobal("indexedDB", factory);
  try {
    await expect(new IndexedDbTabooCardRepository().list()).rejects.toMatchObject({
      cause: { name: "VersionError" },
    });
  } finally {
    vi.unstubAllGlobals();
  }
});

it("rejects malformed cards without persisting part of the batch", async () => {
  const repository = new IndexedDbTabooCardRepository(new IDBFactory());
  await expect(repository.addAll([card, { ...card, id: "bad", term: "" }])).rejects.toThrow(
    TypeError,
  );
  expect(await repository.list()).toEqual([]);
});
