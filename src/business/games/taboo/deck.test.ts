import { describe, expect, it } from "vitest";
import { buildDeck, type DeckCriteria } from "./deck";
import type { TabooCard } from "./model";

const moon: TabooCard = {
  id: "moon",
  language: "en",
  term: "Moon",
  forbiddenWords: ["night", "sky", "orbit"],
  categoryId: "space",
  difficulty: "easy",
};
const criteria: DeckCriteria = { language: "en", minimumCards: 1 };

describe("buildDeck", () => {
  it("combines filters and excludes invalid, duplicate and already used cards", () => {
    const cards: TabooCard[] = [
      { ...moon, id: "wrong-language", language: "de" },
      { ...moon, id: "wrong-category", categoryId: "nature" },
      { ...moon, id: "wrong-difficulty", difficulty: "hard" },
      { ...moon, id: "invalid", term: "" },
      { ...moon, id: "used" },
      { ...moon, id: " moon " },
      moon,
    ];
    expect(
      buildDeck(
        cards,
        {
          ...criteria,
          categoryIds: ["space"],
          difficulties: ["easy"],
          excludedCardIds: ["used"],
        },
        () => 0,
      ),
    ).toEqual({ status: "ready", cards: [moon] });
  });

  it("shuffles deterministically without changing the source order", () => {
    const cards = [
      moon,
      { ...moon, id: "mars", term: "Mars" },
      { ...moon, id: "venus", term: "Venus" },
    ];
    const filters = { ...criteria, categoryIds: [], difficulties: [], minimumCards: 3 };
    expect(buildDeck(cards, filters, () => 0)).toEqual({
      status: "ready",
      cards: [cards[1], cards[2], moon],
    });
    expect(buildDeck(cards, filters, () => 0.99).cards).toEqual(cards);
    expect(cards.map((card) => card.id)).toEqual(["moon", "mars", "venus"]);
  });

  it("reports empty and undersized decks without padding them", () => {
    expect(buildDeck([moon], { ...criteria, language: "de" }, () => 0)).toEqual({
      status: "empty",
      cards: [],
    });
    expect(buildDeck([moon], { ...criteria, minimumCards: 2 }, () => 0)).toEqual({
      status: "insufficient",
      cards: [moon],
    });
  });

  it.each([0, 1.5])("rejects invalid minimum %s", (minimumCards) => {
    expect(() => buildDeck([moon], { ...criteria, minimumCards }, () => 0)).toThrow(RangeError);
  });

  it.each([NaN, -0.1, 1])("rejects invalid random sample %s", (sample) => {
    expect(() => buildDeck([moon, { ...moon, id: "mars" }], criteria, () => sample)).toThrow(
      RangeError,
    );
  });
});
