import { expect, it } from "vitest";
import { builtInCategories } from "../business/games/taboo/categories";
import { loadTabooCardPack } from "./tabooCardPool";
import { tabooStandardCards } from "./tabooStandardCards";

it.each(["de", "en"] as const)(
  "ships a valid %s pack that lists all categories",
  async (language) => {
    const pack = await loadTabooCardPack(language);
    expect(pack?.language).toBe(language);
    const ids = pack?.categories.map((category) => category.id) ?? [];
    expect(ids).toHaveLength(10);
    // The three categories of the built-in cards keep their ids and names.
    for (const category of builtInCategories) {
      expect(pack?.categories.find((item) => item.id === category.id)?.names).toEqual(
        category.names,
      );
    }
    // Every card of the pack belongs to a listed category in the pack's language.
    for (const card of pack?.cards ?? []) {
      expect(ids).toContain(card.categoryId);
      expect(card.language).toBe(language);
    }
  },
);

it.each(["de", "en"] as const)(
  "ships a large %s pool with enough cards in every category and difficulty",
  async (language) => {
    const pack = await loadTabooCardPack(language);
    const cards = pack?.cards ?? [];
    expect(cards.length).toBeGreaterThanOrEqual(500);
    for (const category of pack?.categories ?? []) {
      for (const difficulty of ["easy", "medium", "hard"]) {
        const count = cards.filter(
          (card) => card.categoryId === category.id && card.difficulty === difficulty,
        ).length;
        expect(count, `${category.id}/${difficulty}`).toBeGreaterThanOrEqual(15);
      }
    }
  },
);

it.each(["de", "en"] as const)(
  "keeps ids and terms of the %s pool and the built-in cards apart",
  async (language) => {
    const pack = await loadTabooCardPack(language);
    const builtIn = tabooStandardCards.filter((card) => card.language === language);
    const all = [...builtIn, ...(pack?.cards ?? [])];
    expect(new Set(all.map((card) => card.id)).size).toBe(all.length);
    expect(new Set(all.map((card) => card.term.toLowerCase())).size).toBe(all.length);
  },
);
