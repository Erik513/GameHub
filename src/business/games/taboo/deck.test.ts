import { describe, expect, it } from "vitest";
import { buildDeck, interleaveByDifficulty, type DeckCriteria } from "./deck";
import type { TabooCard } from "./model";

const moon: TabooCard = {
  id: "moon",
  language: "en",
  term: "Moon",
  forbiddenWords: ["night", "sky", "orbit", "space"],
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

describe("interleaveByDifficulty", () => {
  const card = (id: string, difficulty: TabooCard["difficulty"]): TabooCard => ({
    ...moon,
    id,
    difficulty,
  });
  const noShuffle = () => 0.99;

  it("alternates the difficulties even when most cards left are hard", () => {
    const preferred = [
      card("e1", "easy"),
      card("m1", "medium"),
      ...Array.from({ length: 20 }, (_, i) => card(`h${i}`, "hard")),
    ];
    const order = interleaveByDifficulty(preferred, preferred, noShuffle);
    // The first round holds one card of every difficulty; the rest are the hard cards that are left.
    const firstThree = order.slice(0, 3).map((entry) => entry.difficulty);
    expect([...firstThree].sort()).toEqual(["easy", "hard", "medium"]);
    expect(order.slice(3).every((entry) => entry.difficulty === "hard")).toBe(true);
    expect(order).toHaveLength(preferred.length);
  });

  it("fills up a difficulty with cards played before until it is as large as the largest", () => {
    const preferred = [card("h1", "hard"), card("h2", "hard"), card("e-new", "easy")];
    const all = [...preferred, card("e-old1", "easy"), card("e-old2", "easy")];
    const order = interleaveByDifficulty(preferred, all, noShuffle).map((entry) => entry.id);
    // Two hard cards, so easy gets two cards, too: the unplayed one first, then one played before.
    expect(order).toHaveLength(4);
    expect(order.indexOf("e-new")).toBeLessThan(order.indexOf("e-old1"));
    expect(order).not.toContain("e-old2");
  });

  it("returns the preferred cards for one difficulty and draws the order of the difficulties anew", () => {
    const single = [card("a", "easy"), card("b", "easy")];
    expect(interleaveByDifficulty(single, single, noShuffle).map((entry) => entry.id)).toEqual([
      "a",
      "b",
    ]);
    const mixed = [card("e", "easy"), card("h", "hard")];
    const low = interleaveByDifficulty(mixed, mixed, () => 0).map((entry) => entry.id);
    const high = interleaveByDifficulty(mixed, mixed, () => 0.99).map((entry) => entry.id);
    expect([low, high].map((order) => [...order].sort())).toEqual([
      ["e", "h"],
      ["e", "h"],
    ]);
    expect(low).not.toEqual(high);
  });
});
