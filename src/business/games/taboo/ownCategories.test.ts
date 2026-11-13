import { expect, it } from "vitest";
import { ownCategories } from "./categories";
import type { TabooCard } from "./model";

const card = (id: string, categoryId: string, language: "de" | "en"): TabooCard => ({
  id,
  language,
  term: id,
  forbiddenWords: ["a", "b", "c", "d"],
  categoryId,
  difficulty: "easy",
});

it("lists the own categories of both languages and leaves out the standard ones", () => {
  const cards = [
    card("1", "Sport", "de"),
    card("2", "sport", "de"),
    card("3", "Sport", "en"),
    card("4", "Autos", "en"),
    card("5", "nature", "en"),
  ];
  expect(ownCategories(cards, ["nature"])).toEqual([
    { id: "Autos", language: "en" },
    { id: "Sport", language: "de" },
    { id: "Sport", language: "en" },
  ]);
});
