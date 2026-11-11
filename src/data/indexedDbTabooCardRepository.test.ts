import { IDBFactory } from "fake-indexeddb";
import { expect, it, vi } from "vitest";
import type { TabooCard } from "../business/games/taboo/model";
import { IndexedDbTabooCardRepository } from "./indexedDbTabooCardRepository";

const card: TabooCard = {
  id: "moon",
  language: "en",
  term: "Moon",
  forbiddenWords: ["night", "sky", "orbit", "space"],
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

function stubFactory(trigger: (request: IDBOpenDBRequest) => void): IDBFactory {
  const request = {} as IDBOpenDBRequest;
  return {
    open: () => {
      queueMicrotask(() => trigger(request));
      return request;
    },
  } as unknown as IDBFactory;
}

it("reports a failed database open", async () => {
  const repository = new IndexedDbTabooCardRepository(
    stubFactory((request) => {
      Object.defineProperty(request, "error", { value: new DOMException("denied") });
      request.onerror?.(new Event("error"));
    }),
  );
  await expect(repository.list()).rejects.toMatchObject({
    message: "Could not open GameHub storage.",
    cause: { message: "denied" },
  });
});

it("rejects a blocked upgrade and closes the late connection", async () => {
  const close = vi.fn();
  const repository = new IndexedDbTabooCardRepository(
    stubFactory((request) => {
      request.onblocked?.(new Event("blocked") as IDBVersionChangeEvent);
      Object.defineProperty(request, "result", { value: { close } });
      request.onsuccess?.(new Event("success"));
    }),
  );
  await expect(repository.list()).rejects.toThrow("blocked by another connection");
  expect(close).toHaveBeenCalledOnce();
});

it("rejects a read that is aborted and still closes the database", async () => {
  const close = vi.fn();
  const transaction = {
    error: new DOMException("aborted"),
    objectStore: () => ({ getAll: () => ({ result: [] }) }),
  } as unknown as IDBTransaction;
  const database = { close, transaction: () => transaction } as unknown as IDBDatabase;
  const repository = new IndexedDbTabooCardRepository(
    stubFactory((request) => {
      Object.defineProperty(request, "result", { value: database });
      request.onsuccess?.(new Event("success"));
      queueMicrotask(() => void transaction.onabort?.(new Event("abort")));
    }),
  );
  await expect(repository.list()).rejects.toMatchObject({ message: "Card read aborted." });
  expect(close).toHaveBeenCalledOnce();
});

it("rejects an invalid card before touching the storage", async () => {
  const repository = new IndexedDbTabooCardRepository(new IDBFactory());
  await expect(
    repository.addAll([{ ...card, forbiddenWords: ["only", "three", "words"] }] as never),
  ).rejects.toThrow("Invalid custom Taboo card.");
  expect(await repository.list()).toEqual([]);
});

it("updates a saved card, rejects unknown or invalid cards and removes a card", async () => {
  const repository = new IndexedDbTabooCardRepository(new IDBFactory());
  const other = { ...card, id: "sun", term: "Sun" };
  await repository.addAll([card, other]);

  await repository.update({ ...card, term: " Full moon ", difficulty: "hard" });
  expect(await repository.list()).toEqual([
    { ...card, term: "Full moon", difficulty: "hard" },
    other,
  ]);

  await expect(repository.update({ ...card, id: "missing" })).rejects.toThrow("aborted");
  await expect(
    repository.update({ ...card, forbiddenWords: ["a", "a", "b", "c"] }),
  ).rejects.toThrow(TypeError);

  await repository.remove("moon");
  await repository.remove("never-existed");
  expect(await repository.list()).toEqual([other]);
});
