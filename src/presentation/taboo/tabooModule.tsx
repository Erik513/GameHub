import type { TabooCardRepository } from "../../business/games/taboo/cardRepository";
import type { TabooCard } from "../../business/games/taboo/model";
import type { GameModule } from "../gameModule";
import type { TabooGenerators } from "./TabooGeneration";
import { TabooLibrary } from "./TabooLibrary";

interface TabooModuleOptions {
  /** The standard cards that ship with the app. */
  readonly cards?: readonly TabooCard[];
  readonly generators?: TabooGenerators | undefined;
  /** Storage for the player's own cards. */
  readonly repository?: TabooCardRepository | undefined;
}

/** Wires Taboo with its cards, storage and generators for the composition root. */
export function createTabooModule({
  cards = [],
  generators,
  repository,
}: TabooModuleOptions = {}): GameModule {
  return {
    id: "taboo",
    Screen: ({ cardLanguage }) => (
      <TabooLibrary
        cardLanguage={cardLanguage}
        cards={cards}
        generators={generators}
        repository={repository}
      />
    ),
  };
}
