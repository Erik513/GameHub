import { describe, expect, it } from "vitest";
import { mergeStandardCards, parseTabooCardPack } from "./cardPack";
import {
  availableCategories,
  builtInCategories,
  categoryName,
  customCategoryIds,
  mergeCategoryInfos,
} from "./categories";
import type { TabooCard } from "./model";

const pack = {
  format: "gamehub-taboo-pack",
  version: 1,
  language: "de",
  categories: [
    { id: "food", names: { de: "Essen und Trinken", en: "Food and drink" } },
    { id: "animals", names: { de: "Tiere", en: "Animals" } },
  ],
  cards: [
    {
      id: "p-1",
      term: "Pizza",
      forbiddenWords: ["Käse", "Teig", "Italien", "Ofen"],
      categoryId: "food",
      difficulty: "easy",
    },
    {
      id: "p-2",
      term: "Igel",
      forbiddenWords: ["Stachel", "Garten", "Winterschlaf", "Tier"],
      categoryId: "animals",
      difficulty: "medium",
    },
  ],
};

const clone = () => JSON.parse(JSON.stringify(pack)) as Record<string, unknown>;

describe("parseTabooCardPack", () => {
  it("returns the categories and gives every card the language of the pack", () => {
    const parsed = parseTabooCardPack(pack);
    expect(parsed.language).toBe("de");
    expect(parsed.categories.map((category) => category.id)).toEqual(["food", "animals"]);
    expect(parsed.cards.map((card) => [card.term, card.language])).toEqual([
      ["Pizza", "de"],
      ["Igel", "de"],
    ]);
  });

  it("accepts an empty pack that only lists categories", () => {
    expect(parseTabooCardPack({ ...pack, cards: [] }).cards).toEqual([]);
  });

  it.each([
    ["not an object", () => "x"],
    ["wrong format", () => ({ ...clone(), format: "other" })],
    ["wrong version", () => ({ ...clone(), version: 2 })],
    ["unsupported language", () => ({ ...clone(), language: "fr" })],
    ["missing lists", () => ({ ...clone(), cards: undefined })],
    ["category without names", () => ({ ...clone(), categories: [{ id: "x" }] })],
    [
      "category with an empty name",
      () => ({ ...clone(), categories: [{ id: "x", names: { de: " ", en: "X" } }] }),
    ],
    [
      "category with non-text names",
      () => ({ ...clone(), categories: [{ id: "x", names: { de: 1, en: "X" } }] }),
    ],
    [
      "empty category id",
      () => ({ ...clone(), categories: [{ id: " ", names: { de: "A", en: "A" } }] }),
    ],
    [
      "repeated category id",
      () => ({ ...clone(), categories: [...pack.categories, pack.categories[0]] }),
    ],
    ["card that is not an object", () => ({ ...clone(), cards: ["x"] })],
    [
      "card with a wrong field type",
      () => ({ ...clone(), cards: [{ ...pack.cards[0], term: 5 }] }),
    ],
    [
      "card with a wrong difficulty",
      () => ({ ...clone(), cards: [{ ...pack.cards[0], difficulty: "extreme" }] }),
    ],
    [
      "card with non-text words",
      () => ({ ...clone(), cards: [{ ...pack.cards[0], forbiddenWords: [1, 2, 3, 4] }] }),
    ],
    [
      "card with three words",
      () => ({ ...clone(), cards: [{ ...pack.cards[0], forbiddenWords: ["a", "b", "c"] }] }),
    ],
    [
      "card in an unknown category",
      () => ({ ...clone(), cards: [{ ...pack.cards[0], categoryId: "nope" }] }),
    ],
    [
      "repeated card id",
      () => ({ ...clone(), cards: [pack.cards[0], { ...pack.cards[1], id: "p-1" }] }),
    ],
    [
      "repeated term",
      () => ({ ...clone(), cards: [pack.cards[0], { ...pack.cards[1], term: "pizza" }] }),
    ],
  ])("rejects the whole pack for %s", (_name, make) => {
    expect(() => parseTabooCardPack(make())).toThrow(TypeError);
  });
});

describe("categories and merging", () => {
  const card = (
    id: string,
    term: string,
    categoryId: string,
    language: TabooCard["language"] = "de",
  ): TabooCard => ({
    id,
    term,
    categoryId,
    language,
    difficulty: "easy",
    forbiddenWords: ["a", "b", "c", "d"],
  });

  it("adds pack cards without repeating ids or terms and keeps the base when there are none", () => {
    const base = [card("b-1", "Hund", "nature")];
    expect(mergeStandardCards(base, [])).toBe(base);
    const merged = mergeStandardCards(base, [
      card("p-1", "hund", "animals"),
      card("p-2", "Igel", "animals"),
    ]);
    expect(merged.map((item) => item.id)).toEqual(["b-1", "p-2"]);
  });

  it("merges category lists with the first entry of an id winning", () => {
    const merged = mergeCategoryInfos(builtInCategories, [
      { id: "nature", names: { de: "Anders", en: "Other" } },
      { id: "food", names: { de: "Essen", en: "Food" } },
    ]);
    expect(merged.map((info) => info.id)).toEqual(["everyday", "nature", "culture", "food"]);
    expect(categoryName(merged, "nature", "de")).toBe("Natur");
  });

  it("shows a name per language and falls back to the id", () => {
    expect(categoryName(builtInCategories, "culture", "en")).toBe("Culture");
    expect(categoryName(builtInCategories, "Sport", "de")).toBe("Sport");
  });

  it("always lists the built-in categories and other categories only with cards in the language", () => {
    const infos = mergeCategoryInfos(builtInCategories, parseTabooCardPack(pack).categories);
    const cards = [card("1", "A", "nature"), card("2", "B", "food", "en"), card("3", "C", "food")];
    const ids = (language: "de" | "en") =>
      availableCategories(infos, cards, language).map((info) => info.id);
    expect(ids("de")).toEqual(["everyday", "nature", "culture", "food"]);
    // Without any pack cards of the language only the built-in categories remain.
    expect(ids("en")).toEqual(["everyday", "nature", "culture", "food"]);
    expect(
      availableCategories(infos, [card("1", "A", "nature")], "de").map((info) => info.id),
    ).toEqual(["everyday", "nature", "culture"]);
  });

  it("does not treat pack categories as custom when their ids are passed", () => {
    const cards = [card("1", "A", "food"), card("2", "B", "Sport")];
    expect(customCategoryIds(cards, "de")).toEqual(["food", "Sport"]);
    expect(customCategoryIds(cards, "de", ["food"])).toEqual(["Sport"]);
  });
});
