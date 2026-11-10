import { expect, it } from "vitest";
import { parseTabooCardFile, selectNewTabooCards, serializeTabooCards } from "./cardExchange";
import type { TabooCard } from "./model";

const card: TabooCard = {
  id: "moon",
  term: "Moon",
  language: "en",
  forbiddenWords: ["sky", "night", "orbit"],
  categoryId: "nature",
  difficulty: "easy",
};

it("round-trips a backup and skips duplicate IDs and normalized terms on reimport", () => {
  const restored = parseTabooCardFile(serializeTabooCards([card]));
  expect(restored).toEqual([card]);
  expect(selectNewTabooCards(restored, [])).toEqual([card]);
  expect(selectNewTabooCards(restored, [card])).toEqual([]);
  expect(selectNewTabooCards([{ ...card, id: "other", term: " MOON " }], [card])).toEqual([]);
  expect(selectNewTabooCards([card, card], [])).toEqual([card]);
});

it.each([
  null,
  { format: "other" },
  { format: "gamehub-taboo-cards", version: 2 },
  { format: "gamehub-taboo-cards", version: 1 },
])("rejects unsupported file %j", (file) => {
  expect(() => parseTabooCardFile(JSON.stringify(file))).toThrow(TypeError);
});

it.each([
  null,
  { ...card, id: 1 },
  { ...card, language: "fr" },
  { ...card, term: 1 },
  { ...card, forbiddenWords: "sky" },
  { ...card, forbiddenWords: [1] },
  { ...card, forbiddenWords: ["sky"] },
  { ...card, categoryId: null },
  { ...card, difficulty: "unknown" },
])("rejects invalid card %j", (item) => {
  expect(() =>
    parseTabooCardFile(
      JSON.stringify({ format: "gamehub-taboo-cards", version: 1, cards: [item] }),
    ),
  ).toThrow(TypeError);
});

it.each(["medium", "hard"] as const)("accepts %s German cards", (difficulty) => {
  const german = { ...card, language: "de", term: "Mond", difficulty } as const;
  expect(parseTabooCardFile(serializeTabooCards([german]))).toEqual([german]);
});
