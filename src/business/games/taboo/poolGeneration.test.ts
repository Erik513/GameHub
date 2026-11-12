import { describe, expect, it } from "vitest";
import {
  buildPoolPrompt,
  maxAvoidTerms,
  parsePoolResponse,
  poolCardId,
  poolCategoryBriefs,
  reviewPoolCards,
} from "./poolGeneration";
import type { TabooCard } from "./model";

const food = { id: "food", names: { de: "Essen und Trinken", en: "Food and drink" } };
const request = { category: food, difficulty: "easy", language: "de" } as const;

const good = { term: "Pizza", forbiddenWords: ["Käse", "Teig", "Italien", "Ofen"] };

describe("buildPoolPrompt", () => {
  it("states language, category with its brief, difficulty, count and the rules", () => {
    const prompt = buildPoolPrompt({ ...request, count: 12, avoidTerms: [] });
    expect(prompt.system).toContain("in German");
    expect(prompt.system).toContain("exactly four forbidden words");
    expect(prompt.system).toContain("umbrella");
    expect(prompt.user).toContain("Create 12 different cards.");
    expect(prompt.user).toContain(`Food and drink (${poolCategoryBriefs.food})`);
    expect(prompt.user).toContain("Difficulty: easy:");
    expect(prompt.user).not.toContain("Do not use these terms");
  });

  it("lists only the most recent terms to avoid and falls back to the category name", () => {
    const avoid = Array.from({ length: maxAvoidTerms + 5 }, (_, index) => `term${index}`);
    const prompt = buildPoolPrompt({
      ...request,
      category: { id: "custom", names: { de: "Eigene", en: "Own" } },
      count: 3,
      language: "en",
      avoidTerms: avoid,
    });
    expect(prompt.user).toContain("Own (Own)");
    expect(prompt.user).toContain(`term${maxAvoidTerms + 4}`);
    expect(prompt.user).not.toContain("term4,");
    expect(prompt.system).toContain("in English");
  });
});

describe("parsePoolResponse", () => {
  it("reads the cards from clean JSON, from a bare list and from text around the JSON", () => {
    const json = JSON.stringify({ cards: [good] });
    expect(parsePoolResponse(json)).toEqual([good]);
    expect(parsePoolResponse(JSON.stringify([good]))).toEqual([good]);
    expect(parsePoolResponse(`Here you go:\n${json}\nHave fun!`)).toEqual([good]);
  });

  it("returns an empty list for text without usable JSON", () => {
    expect(parsePoolResponse("no json here")).toEqual([]);
    expect(parsePoolResponse("{ broken")).toEqual([]);
    expect(parsePoolResponse('{"other":1}')).toEqual([]);
  });
});

describe("poolCardId", () => {
  it("builds a stable ascii id from the language, category and term", () => {
    expect(poolCardId("de", "food", "Schnitzel mit Pommes")).toBe(
      "pool-de-food-schnitzel-mit-pommes",
    );
    expect(poolCardId("de", "food", "Käse-Brötchen")).toBe("pool-de-food-kaese-broetchen");
    expect(poolCardId("en", "tech", "Café")).toBe("pool-en-tech-cafe");
    expect(poolCardId("en", "tech", "!!!")).toBe("pool-en-tech-card");
  });
});

describe("reviewPoolCards", () => {
  const existing: TabooCard[] = [
    {
      id: "old",
      language: "de",
      term: "Pasta",
      forbiddenWords: ["Nudeln", "Soße", "Italien", "kochen"],
      categoryId: "food",
      difficulty: "easy",
    },
  ];

  it("accepts a good card with a stable id and the requested category and difficulty", () => {
    const review = reviewPoolCards(request, [good], existing);
    expect(review.rejected).toEqual([]);
    expect(review.accepted).toEqual([
      {
        id: "pool-de-food-pizza",
        language: "de",
        term: "Pizza",
        forbiddenWords: ["Käse", "Teig", "Italien", "Ofen"],
        categoryId: "food",
        difficulty: "easy",
      },
    ]);
  });

  it.each([
    ["a missing term", { forbiddenWords: good.forbiddenWords }, "term missing or too long"],
    [
      "a too long term",
      { term: "x".repeat(41), forbiddenWords: good.forbiddenWords },
      "term missing or too long",
    ],
    ["three words", { term: "Brot", forbiddenWords: ["a", "b", "c"] }, "not four forbidden words"],
    [
      "words that are not a list",
      { term: "Brot", forbiddenWords: "Mehl" },
      "not four forbidden words",
    ],
    [
      "a non-text word",
      { term: "Brot", forbiddenWords: ["Mehl", 2, "Ofen", "Teig"] },
      "not four forbidden words",
    ],
    [
      "a word with digits",
      { term: "Brot", forbiddenWords: ["Mehl", "Typ 405", "Ofen", "Teig"] },
      "word too long or with digits",
    ],
    [
      "a too long word",
      { term: "Brot", forbiddenWords: ["Mehl", "x".repeat(31), "Ofen", "Teig"] },
      "word too long or with digits",
    ],
    [
      "a word that contains the term",
      { term: "Brot", forbiddenWords: ["Mehl", "Brötchen", "Brotkorb", "Teig"] },
      "a forbidden word contains the term or is part of it",
    ],
    [
      "a word inside the term",
      { term: "Apfelkuchen", forbiddenWords: ["Apfel", "Teig", "Ofen", "Gebäck"] },
      "a forbidden word contains the term or is part of it",
    ],
    [
      "repeated words",
      { term: "Brot", forbiddenWords: ["Mehl", "mehl", "Ofen", "Teig"] },
      "invalid card (duplicate)",
    ],
    [
      "an existing term",
      { term: "pasta", forbiddenWords: ["Nudeln", "Soße", "Ofen", "Teig"] },
      "term or id exists already",
    ],
  ])("rejects %s with a reason", (_name, candidate, reason) => {
    const review = reviewPoolCards(request, [candidate], existing);
    expect(review.accepted).toEqual([]);
    expect(review.rejected[0]?.reason).toBe(reason);
  });

  it("rejects values that are not objects and repeats inside one batch", () => {
    const review = reviewPoolCards(request, ["text", null, good, { ...good }], existing);
    expect(review.accepted.map((card) => card.term)).toEqual(["Pizza"]);
    expect(review.rejected.map((item) => item.reason)).toEqual([
      "term missing or too long",
      "term missing or too long",
      "term or id exists already",
    ]);
  });

  it("keeps short words from blocking cards through a tiny overlap", () => {
    const review = reviewPoolCards(
      request,
      [{ term: "Ei", forbiddenWords: ["Huhn", "Ostern", "Frühstück", "kochen"] }],
      [],
    );
    expect(review.accepted.map((card) => card.term)).toEqual(["Ei"]);
  });
});
