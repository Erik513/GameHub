import { expect, it, vi } from "vitest";
import type { TabooGenerationRequest } from "../business/games/taboo/cardGenerator";
import { reviewGeneratedCards } from "../business/games/taboo/validateGeneratedCards";
import { tabooLocalCandidates } from "../data/tabooLocalCandidates";
import { tabooStandardCards } from "../data/tabooStandardCards";
import { createLocalTabooCardGenerator } from "./localTabooCardGenerator";

const request: TabooGenerationRequest = {
  language: "en",
  categoryId: "nature",
  difficulty: "easy",
  count: 1,
};

it("selects deterministic cards without repeating candidates", async () => {
  const provider = createLocalTabooCardGenerator(tabooLocalCandidates, () => 0);
  const result = await provider.generate({ ...request, count: 2 });
  expect(result).toMatchObject({
    status: "complete",
    candidates: [{ term: "Cat" }, { term: "Banana" }],
  });
  expect(await provider.generate({ ...request, count: 2 })).toEqual(result);
  expect(provider.capabilities.worksOffline).toBe(true);
  expect(
    await createLocalTabooCardGenerator(tabooLocalCandidates, () => 0.99).generate(request),
  ).toMatchObject({ status: "complete", candidates: [{ term: "Banana" }] });
});

it("validates all local candidates without network access and distinguishes partial results", async () => {
  const fetch = vi.fn().mockRejectedValue(new Error("Offline"));
  vi.stubGlobal("fetch", fetch);
  try {
    const provider = createLocalTabooCardGenerator(tabooLocalCandidates, () => 0);
    for (const language of ["de", "en"] as const) {
      for (const categoryId of ["everyday", "nature", "culture"]) {
        for (const difficulty of ["easy", "medium", "hard"] as const) {
          const selection = { language, categoryId, difficulty, count: 3 };
          const result = await provider.generate(selection);
          expect(result.status).toBe("partial");
          if (result.status === "failed") throw new Error("Local provider unexpectedly failed");
          let id = 0;
          const review = reviewGeneratedCards(
            selection,
            result.candidates,
            tabooStandardCards,
            () => `local-${++id}`,
          );
          expect(review.accepted).toHaveLength(2);
          expect(review.rejected).toEqual([]);
        }
      }
    }
    expect(fetch).not.toHaveBeenCalled();
  } finally {
    vi.unstubAllGlobals();
  }
});

it("reports invalid counts, unsupported languages and cancellation", async () => {
  const provider = createLocalTabooCardGenerator(tabooLocalCandidates);
  for (const count of [0, 1.5, 11]) {
    expect(await provider.generate({ ...request, count })).toEqual({
      status: "failed",
      code: "unsupported_request",
    });
  }
  expect(await provider.generate({ ...request, language: "fr" as "en" })).toEqual({
    status: "failed",
    code: "unsupported_request",
  });
  expect(
    await provider.generate(request, { aborted: true, subscribe: () => () => undefined }),
  ).toEqual({
    status: "failed",
    code: "cancelled",
  });
  expect(
    await createLocalTabooCardGenerator(tabooLocalCandidates, () => NaN).generate(request),
  ).toEqual({ status: "failed", code: "generation_failed" });
  expect(await provider.generate({ ...request, categoryId: "unknown" })).toEqual({
    status: "partial",
    candidates: [],
  });
});
