import { describe, expect, it } from "vitest";
import type { Difficulty, TabooCard } from "./model";
import { compareText, sortByLabel, sortCardsForList } from "./ordering";

const card = (term: string, difficulty: Difficulty): TabooCard => ({
  id: `${term}-${difficulty}`,
  language: "de",
  term,
  forbiddenWords: ["a", "b", "c", "d"],
  categoryId: "x",
  difficulty,
});

describe("sortCardsForList", () => {
  it("puts easy cards first and hard cards last, alphabetical within a difficulty", () => {
    const sorted = sortCardsForList(
      [
        card("Zebra", "hard"),
        card("Apfel", "medium"),
        card("Zahn", "easy"),
        card("Ärmel", "easy"),
        card("birne", "easy"),
        card("Aal", "hard"),
      ],
      "de",
    );
    expect(sorted.map((item) => item.term)).toEqual([
      "Ärmel",
      "birne",
      "Zahn",
      "Apfel",
      "Aal",
      "Zebra",
    ]);
  });

  it("does not change its input", () => {
    const cards = [card("B", "hard"), card("A", "easy")];
    sortCardsForList(cards, "de");
    expect(cards.map((item) => item.term)).toEqual(["B", "A"]);
  });
});

describe("compareText and sortByLabel", () => {
  it("sorts umlauts with their base letter in German and ignores case", () => {
    expect(["Zoo", "Äpfel", "apfel", "Berufe"].sort((a, b) => compareText(a, b, "de"))).toEqual([
      "Äpfel",
      "apfel",
      "Berufe",
      "Zoo",
    ]);
  });

  it("sorts numbers by value", () => {
    expect(["Level 10", "Level 2"].sort((a, b) => compareText(a, b, "en"))).toEqual([
      "Level 2",
      "Level 10",
    ]);
  });

  it("sorts items by a label function without changing the input", () => {
    const items = [{ name: "Sport" }, { name: "alltag" }, { name: "Essen" }];
    expect(sortByLabel(items, (item) => item.name, "de").map((item) => item.name)).toEqual([
      "alltag",
      "Essen",
      "Sport",
    ]);
    expect(items[0]?.name).toBe("Sport");
  });
});
