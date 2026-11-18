import type { TabooCardRepository } from "../../business/games/taboo/cardRepository";
import type { TabooCardPack } from "../../business/games/taboo/cardPack";
import type { TabooCard } from "../../business/games/taboo/model";
import type { PlayedCardsStore } from "../../business/games/taboo/playedCards";
import type { SupportedLanguage } from "../../i18n";
import type { GameModule } from "../gameModule";
import type { TabooGenerators } from "./TabooGeneration";
import { PlayedCardsProvider } from "./PlayedCardsProvider";
import { TabooLibrary } from "./TabooLibrary";

interface TabooModuleOptions {
  /** The standard cards that ship with the app. */
  readonly cards?: readonly TabooCard[];
  readonly generators?: TabooGenerators | undefined;
  /** Remembers which cards were played, so new games prefer unplayed ones. */
  readonly playedCards?: PlayedCardsStore | undefined;
  /** Loads the card pack of a language, the part of the cards that is not in the code. */
  readonly loadCardPack?:
    ((language: SupportedLanguage) => Promise<TabooCardPack | undefined>) | undefined;
  /** Storage for the player's own cards. */
  readonly repository?: TabooCardRepository | undefined;
}

/** Wires Taboo with its cards, storage and generators for the composition root. */
export function createTabooModule({
  cards = [],
  generators,
  loadCardPack,
  playedCards,
  repository,
}: TabooModuleOptions = {}): GameModule {
  return {
    id: "taboo",
    Screen: ({ cardLanguage, onCardLanguageChange }) => (
      <PlayedCardsProvider store={playedCards}>
        <TabooLibrary
          cardLanguage={cardLanguage}
          onCardLanguageChange={onCardLanguageChange}
          cards={cards}
          generators={generators}
          loadCardPack={loadCardPack}
          repository={repository}
        />
      </PlayedCardsProvider>
    ),
  };
}
