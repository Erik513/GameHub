import type { TabooCard } from "./model";

export interface TabooCardRepository {
  list(): Promise<readonly TabooCard[]>;
  addAll(cards: readonly TabooCard[]): Promise<void>;
  /** Replaces a saved card with the same id; rejects when no such card exists. */
  update(card: TabooCard): Promise<void>;
  /** Deletes the card with this id; does nothing when it does not exist. */
  remove(id: string): Promise<void>;
}
