import { expect, it } from "vitest";
import { builtInCategories } from "../business/games/taboo/categories";
import { loadTabooCardPack } from "./tabooCardPool";

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
