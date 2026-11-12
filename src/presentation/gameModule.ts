import type { ComponentType } from "react";
import type { SupportedLanguage } from "../i18n";

/** What the app gives to the main window of every game. */
export interface GameScreenProps {
  /** The language of the game's content (cards, questions); a setting of each game. */
  readonly cardLanguage: SupportedLanguage;
  /** Lets the game change the content language, for example from its own settings. */
  readonly onCardLanguageChange: (language: SupportedLanguage) => void;
}

/**
 * A playable game. The app knows games only through this contract and the catalog entry with the
 * same id: it renders the screen and never sees game-specific data or services.
 */
export interface GameModule {
  /** Matches the `id` of the game's entry in the game catalog. */
  readonly id: string;
  /** The main window of the game (setup, play, result). */
  readonly Screen: ComponentType<GameScreenProps>;
}
