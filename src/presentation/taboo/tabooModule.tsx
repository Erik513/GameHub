import type { TabooCardRepository } from "../../business/games/taboo/cardRepository";
import type { TabooCard } from "../../business/games/taboo/model";
import type { TabooWordSuggester } from "../../business/games/taboo/wordSuggester";
import type { GameModule } from "../gameModule";
import type { TabooGenerators } from "./TabooGeneration";
import { TabooLibrary } from "./TabooLibrary";

interface TabooModuleOptions {
  /** The standard cards that ship with the app. */
  readonly cards?: readonly TabooCard[];
  readonly generators?: TabooGenerators | undefined;
  /** Looks for a local AI that suggests forbidden words; resolves to nothing without one. */
  readonly findWordSuggester?:
    ((signal: AbortSignal) => Promise<TabooWordSuggester | undefined>) | undefined;
  /** Storage for the player's own cards. */
  readonly repository?: TabooCardRepository | undefined;
}

/** Wires Taboo with its cards, storage and generators for the composition root. */
export function createTabooModule({
  cards = [],
  findWordSuggester,
  generators,
  repository,
}: TabooModuleOptions = {}): GameModule {
  return {
    id: "taboo",
    Screen: ({ cardLanguage }) => (
      <TabooLibrary
        cardLanguage={cardLanguage}
        cards={cards}
        findWordSuggester={findWordSuggester}
        generators={generators}
        repository={repository}
      />
    ),
  };
}
