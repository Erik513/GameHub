import { describe, expect, it } from "vitest";
import {
  aiCardsPerTurn,
  maxCardsPerRequest,
  planGenerationRequests,
  raceSpareCardsPerTeam,
  requiredCards,
} from "./cardPlan";

describe("requiredCards", () => {
  it("needs one card per turn in a classic game", () => {
    expect(requiredCards({ mode: "classic", raceTarget: 5, roundsPerTeam: 3, teamCount: 2 })).toBe(
      6,
    );
    expect(requiredCards({ mode: "classic", raceTarget: 5, roundsPerTeam: 10, teamCount: 3 })).toBe(
      30,
    );
  });

  it("needs only one card per team to start when the rounds are unlimited", () => {
    expect(
      requiredCards({ mode: "classic", raceTarget: 5, roundsPerTeam: "unlimited", teamCount: 4 }),
    ).toBe(4);
  });

  it("needs the cards of all runs plus spare cards per team in a race", () => {
    expect(requiredCards({ mode: "race", raceTarget: 5, roundsPerTeam: 1, teamCount: 3 })).toBe(
      3 * (5 + raceSpareCardsPerTeam),
    );
  });
});

describe("planGenerationRequests", () => {
  const base = {
    categories: ["food", "sport"],
    difficulties: ["easy", "hard"] as const,
    language: "en" as const,
    mode: "classic" as const,
    required: 6,
  };

  it("asks for two extra cards per category in a mixed deck", () => {
    expect(planGenerationRequests({ ...base, source: "both" })).toEqual([
      { language: "en", categoryId: "food", difficulty: "easy", count: 2 },
      { language: "en", categoryId: "sport", difficulty: "easy", count: 2 },
    ]);
  });

  it("makes the whole deck of an AI-only game in requests of at most ten cards", () => {
    const requests = planGenerationRequests({ ...base, required: 30, source: "ai" });
    const perCategory = Math.ceil((30 * aiCardsPerTurn) / 2);
    expect(requests.every((request) => request.count <= maxCardsPerRequest)).toBe(true);
    for (const categoryId of base.categories) {
      const mine = requests.filter((request) => request.categoryId === categoryId);
      expect(mine.reduce((sum, request) => sum + request.count, 0)).toBe(perCategory);
      // The difficulties take turns.
      expect(mine.slice(0, 3).map((request) => request.difficulty)).toEqual([
        "easy",
        "hard",
        "easy",
      ]);
    }
  });

  it("asks for twice the cards of a race and at least two per category", () => {
    const race = planGenerationRequests({ ...base, mode: "race", required: 10, source: "ai" });
    expect(race.reduce((sum, request) => sum + request.count, 0)).toBe(20);
    const tiny = planGenerationRequests({ ...base, required: 0, source: "ai" });
    expect(tiny.map((request) => request.count)).toEqual([2, 2]);
  });

  it("falls back to easy cards without a chosen difficulty", () => {
    const [request] = planGenerationRequests({
      ...base,
      difficulties: [],
      source: "both",
    });
    expect(request?.difficulty).toBe("easy");
  });
});
