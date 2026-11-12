import { parseTabooCardPack, type TabooCardPack } from "../business/games/taboo/cardPack";
import type { SupportedLanguage } from "../i18n";

/**
 * Loads the card pack of one language as its own part of the app, so the cards are only fetched
 * when Taboo is opened. A missing or damaged pack gives `undefined`, and the game falls back to
 * the cards that are built into the code.
 */
export async function loadTabooCardPack(
  language: SupportedLanguage,
): Promise<TabooCardPack | undefined> {
  try {
    const loaded: { default: unknown } =
      language === "de" ? await import("./pool/de.json") : await import("./pool/en.json");
    return parseTabooCardPack(loaded.default);
  } catch {
    return undefined;
  }
}
