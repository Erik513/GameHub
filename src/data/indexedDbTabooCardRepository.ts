import type { TabooCardRepository } from "../business/games/taboo/cardRepository";
import { validateCard, type TabooCard } from "../business/games/taboo/model";

const schemaVersion = 1;
const cardStore = "tabooCustomCards";

export class IndexedDbTabooCardRepository implements TabooCardRepository {
  constructor(
    private readonly factory: IDBFactory = globalThis.indexedDB,
    private readonly databaseName = "gamehub",
  ) {}

  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = this.factory.open(this.databaseName, schemaVersion);
      let blocked = false;
      request.onupgradeneeded = () => {
        request.result.createObjectStore(cardStore, { keyPath: "id" });
      };
      request.onblocked = () => {
        blocked = true;
        reject(new Error("GameHub storage upgrade is blocked by another connection."));
      };
      request.onerror = () =>
        reject(new Error("Could not open GameHub storage.", { cause: request.error }));
      request.onsuccess = () => {
        const database = request.result;
        if (blocked) {
          database.close();
          return;
        }
        database.onversionchange = () => database.close();
        resolve(database);
      };
    });
  }

  async list(): Promise<readonly TabooCard[]> {
    const database = await this.open();
    try {
      return await new Promise<readonly TabooCard[]>((resolve, reject) => {
        const transaction = database.transaction(cardStore, "readonly");
        const request = transaction.objectStore(cardStore).getAll();
        transaction.oncomplete = () => resolve(request.result as TabooCard[]);
        transaction.onabort = () =>
          reject(new Error("Card read aborted.", { cause: transaction.error }));
      });
    } finally {
      database.close();
    }
  }

  async addAll(cards: readonly TabooCard[]): Promise<void> {
    const validCards = cards.map((card) => {
      const result = validateCard(card);
      if (!result.valid) throw new TypeError("Invalid custom Taboo card.");
      return result.value;
    });

    const database = await this.open();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(cardStore, "readwrite");
        const store = transaction.objectStore(cardStore);
        transaction.oncomplete = () => resolve();
        transaction.onabort = () =>
          reject(new Error("Card write aborted.", { cause: transaction.error }));
        try {
          for (const card of validCards) store.add(card);
        } catch (error) {
          transaction.abort();
          reject(new Error("Card write failed.", { cause: error }));
        }
      });
    } finally {
      database.close();
    }
  }
}
