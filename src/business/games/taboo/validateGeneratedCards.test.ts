import { expect, it, vi } from "vitest";
import type { TabooGenerationRequest } from "./cardGenerator";
import type { TabooCard } from "./model";
import { reviewGeneratedCards, saveGeneratedCards } from "./validateGeneratedCards";

const request: TabooGenerationRequest = {
  language: "de",
  categoryId: "nature",
  difficulty: "easy",
  count: 5,
};
const moon: TabooCard = {
  id: "moon",
  language: "de",
  categoryId: "nature",
  difficulty: "easy",
  term: "Mond",
  forbiddenWords: ["Nacht", "Himmel", "Umlaufbahn"],
};
const bear = { ...moon, term: "  Ba\u0308r ", forbiddenWords: [" Wald ", "Tier", "Honig"] };

it("accepts normalized cards from a partial response and reports duplicates by index", () => {
  let id = 0;
  const result = reviewGeneratedCards(request, [moon, bear, { ...bear, term: "BÄR" }], [moon], () =>
    String(++id),
  );
  expect(result.accepted).toEqual([
    { ...moon, id: "2", term: "Bär", forbiddenWords: ["Wald", "Tier", "Honig"] },
  ]);
  expect(result.rejected).toEqual(
    [0, 2].map((index) => ({
      index,
      issues: [{ field: "card", code: "duplicate" }],
    })),
  );
});

it("reports malformed cards, wrong metadata, and invalid forbidden words", () => {
  const result = reviewGeneratedCards(
    request,
    [
      null,
      "bad",
      { ...moon, term: 5 },
      { ...moon, forbiddenWords: "Nacht" },
      { ...moon, forbiddenWords: [false] },
      { ...moon, forbiddenWords: ["Nacht"] },
      { ...moon, forbiddenWords: ["Nacht", "NACHT", "Himmel"] },
      { ...moon, language: "en", categoryId: 2, difficulty: "hard" },
      { ...moon, categoryId: "culture" },
    ],
    [],
    () => "new",
  );
  expect(result.accepted).toEqual([]);
  expect(result.rejected).toHaveLength(9);
  expect(result.rejected[0]?.issues).toContainEqual({ field: "card", code: "invalid_schema" });
  expect(result.rejected[6]?.issues).toContainEqual({ field: "forbiddenWords", code: "duplicate" });
  expect(result.rejected[7]?.issues).toEqual(
    ["language", "categoryId", "difficulty"].map((field) => ({ field, code: "request_mismatch" })),
  );
});

it("checks fresh storage before submitting one atomic batch and propagates storage failures", async () => {
  const card: TabooCard = { ...moon, id: "bear", term: "Bär" };
  const repository = {
    list: vi.fn().mockResolvedValue([moon]),
    addAll: vi.fn().mockResolvedValue(undefined),
  };
  expect(await saveGeneratedCards(repository, [moon], [])).toEqual([]);
  expect(repository.addAll).not.toHaveBeenCalled();
  expect(await saveGeneratedCards(repository, [moon, card], [])).toEqual([card]);
  expect(repository.addAll).toHaveBeenCalledExactlyOnceWith([card]);
  repository.addAll.mockRejectedValueOnce(new Error("Transaction aborted"));
  await expect(saveGeneratedCards(repository, [card], [])).rejects.toThrow("Transaction aborted");
});
