import type { TabooCard } from "./model";

export interface TabooCardRepository {
  list(): Promise<readonly TabooCard[]>;
  addAll(cards: readonly TabooCard[]): Promise<void>;
}
