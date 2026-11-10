import type { TabooCardCandidate, TabooCardGenerator } from "../business/games/taboo/cardGenerator";

export function createLocalTabooCardGenerator(
  pool: readonly TabooCardCandidate[],
  random: () => number = Math.random,
): TabooCardGenerator {
  const capabilities = {
    languages: ["de", "en"],
    maxCardsPerRequest: 10,
    worksOffline: true,
  } as const;
  return {
    capabilities,
    generate(request, cancellation) {
      if (cancellation?.aborted) return Promise.resolve({ status: "failed", code: "cancelled" });
      if (
        !Number.isSafeInteger(request.count) ||
        request.count < 1 ||
        request.count > capabilities.maxCardsPerRequest ||
        !capabilities.languages.includes(request.language)
      ) {
        return Promise.resolve({ status: "failed", code: "unsupported_request" });
      }
      const matches = pool.filter(
        (card) =>
          card.language === request.language &&
          card.categoryId === request.categoryId &&
          card.difficulty === request.difficulty,
      );
      const candidates: TabooCardCandidate[] = [];
      while (matches.length > 0 && candidates.length < request.count) {
        const sample = random();
        if (!(sample >= 0 && sample < 1)) {
          return Promise.resolve({ status: "failed", code: "generation_failed" });
        }
        const index = Math.floor(sample * matches.length);
        const [candidate] = matches.splice(index, 1);
        if (candidate) candidates.push(candidate);
      }
      return Promise.resolve({
        status: candidates.length === request.count ? "complete" : "partial",
        candidates,
      });
    },
  };
}
