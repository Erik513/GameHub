import { expect, it } from "vitest";
import { validateCard } from "../business/games/taboo/model";
import { tabooStandardCards } from "./tabooStandardCards";

it.each(["de", "en"] as const)("ships valid and distinct %s standard cards", (language) => {
  const cards = tabooStandardCards.filter((card) => card.language === language);
  expect(cards).toHaveLength(45);
  expect(new Set(cards.map((card) => card.id)).size).toBe(cards.length);
  expect(new Set(cards.map((card) => card.term.toLowerCase())).size).toBe(cards.length);
  for (const card of cards) expect(validateCard(card)).toEqual({ valid: true, value: card });
  for (const category of ["everyday", "nature", "culture"]) {
    for (const difficulty of ["easy", "medium", "hard"]) {
      expect(
        cards.filter((card) => card.categoryId === category && card.difficulty === difficulty),
      ).toHaveLength(5);
    }
  }
});
