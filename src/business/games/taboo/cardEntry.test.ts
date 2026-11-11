import { describe, expect, it } from "vitest";
import { parseCardEntries } from "./cardEntry";
import { builtInCategoryIds, customCategoryIds } from "./categories";
import type { TabooCard } from "./model";

const defaults = { categoryId: "Sport", difficulty: "medium", language: "en" } as const;

function counter() {
  let next = 0;
  return () => `own-${(next += 1)}`;
}

describe("parseCardEntries", () => {
  it("creates one card per valid line with the chosen category and difficulty", () => {
    const result = parseCardEntries(
      "Goal: ball, net, score, keeper\n\n  Referee : whistle, rules; match, foul ",
      defaults,
      counter(),
    );
    expect(result.invalidLines).toEqual([]);
    expect(result.cards).toEqual([
      {
        id: "own-1",
        language: "en",
        term: "Goal",
        forbiddenWords: ["ball", "net", "score", "keeper"],
        categoryId: "Sport",
        difficulty: "medium",
      },
      {
        id: "own-2",
        language: "en",
        term: "Referee",
        forbiddenWords: ["whistle", "rules", "match", "foul"],
        categoryId: "Sport",
        difficulty: "medium",
      },
    ]);
  });

  it("reports lines with a missing colon, wrong word count or repeated words", () => {
    const result = parseCardEntries(
      "No colon here\nGoal: ball, net, score\nGoal: ball, ball, net, score\nGoal: goal, a, b, c\nOk: a, b, c, d",
      defaults,
      counter(),
    );
    expect(result.invalidLines).toEqual([1, 2, 3, 4]);
    expect(result.cards.map((card) => card.term)).toEqual(["Ok"]);
  });
});

describe("customCategoryIds", () => {
  const card = (categoryId: string, language: TabooCard["language"]): TabooCard => ({
    id: `${categoryId}-${language}`,
    language,
    term: "Term",
    forbiddenWords: ["a", "b", "c", "d"],
    categoryId,
    difficulty: "easy",
  });

  it("lists distinct custom names of one language, sorted and without built-ins", () => {
    const cards = [
      card("Sport", "en"),
      card("sport", "en"),
      card("Films", "en"),
      card("nature", "en"),
      card("Musik", "de"),
    ];
    expect(customCategoryIds(cards, "en")).toEqual(["Films", "Sport"]);
    expect(customCategoryIds(cards, "de")).toEqual(["Musik"]);
    expect(builtInCategoryIds).toContain("nature");
  });
});
