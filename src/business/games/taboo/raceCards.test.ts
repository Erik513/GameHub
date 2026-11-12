import { describe, expect, it } from "vitest";
import type { Difficulty, TabooCard } from "./model";
import { pickRaceCards, pickRaceReplacement, raceDifficultyMix } from "./raceCards";

function card(id: string, difficulty: Difficulty): TabooCard {
  return {
    id,
    language: "en",
    term: `Term ${id}`,
    forbiddenWords: [`a ${id}`, `b ${id}`, `c ${id}`, `d ${id}`],
    categoryId: "everyday",
    difficulty,
  };
}

function pool(perDifficulty: number): TabooCard[] {
  return (["easy", "medium", "hard"] as const).flatMap((difficulty) =>
    Array.from({ length: perDifficulty }, (_, index) => card(`${difficulty}-${index}`, difficulty)),
  );
}

const count = (cards: readonly TabooCard[], difficulty: Difficulty) =>
  cards.filter((item) => item.difficulty === difficulty).length;

describe("raceDifficultyMix", () => {
  it.each([
    [5, { easy: 2, medium: 2, hard: 1 }],
    [10, { easy: 4, medium: 3, hard: 3 }],
    [15, { easy: 5, medium: 5, hard: 5 }],
    [1, { easy: 1, medium: 0, hard: 0 }],
    [2, { easy: 1, medium: 1, hard: 0 }],
  ])("shares %i cards as equally as possible", (target, mix) => {
    expect(raceDifficultyMix(target)).toEqual(mix);
  });
});

describe("pickRaceCards", () => {
  it("picks the same mix for every team, without repeating a card", () => {
    const cards = pickRaceCards(pool(10), 10, new Set(), new Set());
    expect(cards).toHaveLength(10);
    expect([
      count(cards ?? [], "easy"),
      count(cards ?? [], "medium"),
      count(cards ?? [], "hard"),
    ]).toEqual([4, 3, 3]);
    expect(new Set(cards?.map((item) => item.id)).size).toBe(10);
  });

  it("avoids excluded and already played cards while others exist", () => {
    const all = pool(10);
    const excluded = new Set(all.slice(0, 3).map((item) => item.id));
    const played = new Set(all.slice(3, 6).map((item) => item.id));
    const cards = pickRaceCards(all, 10, excluded, played) ?? [];
    expect(cards.some((item) => excluded.has(item.id))).toBe(false);
    expect(cards.some((item) => played.has(item.id))).toBe(false);
  });

  it("fills a difficulty with too few cards from the others and gives up when the pool is too small", () => {
    const small = [
      ...pool(2),
      ...Array.from({ length: 8 }, (_, index) => card(`easy-x${index}`, "easy")),
    ];
    expect(pickRaceCards(small, 10, new Set(), new Set())).toHaveLength(10);
    expect(pickRaceCards(pool(1), 5, new Set(), new Set())).toBeUndefined();
  });

  it("shuffles the order with the given random source", () => {
    const fixed = () => 0;
    const first = pickRaceCards(pool(10), 10, new Set(), new Set(), fixed);
    const again = pickRaceCards(pool(10), 10, new Set(), new Set(), fixed);
    expect(first?.map((item) => item.id)).toEqual(again?.map((item) => item.id));
  });
});

describe("pickRaceReplacement", () => {
  it("replaces a card by an unused one of the same difficulty", () => {
    const all = pool(3);
    const replaced = card("easy-0", "easy");
    const replacement = pickRaceReplacement(all, replaced, new Set([replaced.id]), new Set());
    expect(replacement?.difficulty).toBe("easy");
    expect(replacement?.id).not.toBe(replaced.id);
  });

  it("takes another difficulty when none is left and nothing when the pool is used up", () => {
    const only = [card("easy-0", "easy"), card("hard-0", "hard")];
    expect(pickRaceReplacement(only, only[0]!, new Set(["easy-0"]), new Set())?.id).toBe("hard-0");
    expect(
      pickRaceReplacement(only, only[0]!, new Set(["easy-0", "hard-0"]), new Set()),
    ).toBeUndefined();
  });
});
