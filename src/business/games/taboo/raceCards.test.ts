import { describe, expect, it } from "vitest";
import type { Difficulty, TabooCard } from "./model";
import {
  pickRaceCards,
  pickRaceReplacement,
  raceCardShortage,
  raceDifficultyMix,
} from "./raceCards";

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
const mixOf = (cards: readonly TabooCard[]) => [
  count(cards, "easy"),
  count(cards, "medium"),
  count(cards, "hard"),
];

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

  it("shares the cards only among the allowed difficulties", () => {
    expect(raceDifficultyMix(5, ["hard"])).toEqual({ easy: 0, medium: 0, hard: 5 });
    expect(raceDifficultyMix(5, ["medium", "hard"])).toEqual({ easy: 0, medium: 3, hard: 2 });
    expect(raceDifficultyMix(5, ["hard", "easy"])).toEqual({ easy: 3, medium: 0, hard: 2 });
    expect(raceDifficultyMix(5, [])).toEqual({ easy: 0, medium: 0, hard: 0 });
  });
});

describe("pickRaceCards", () => {
  it("picks exactly the shared mix every time, without repeating a card", () => {
    const all = pool(20);
    const excluded = new Set<string>();
    // Four teams one after another from the same pool: everyone gets the same mix.
    for (let team = 0; team < 4; team += 1) {
      const cards = pickRaceCards(all, 5, excluded, new Set()) ?? [];
      expect(mixOf(cards)).toEqual([2, 2, 1]);
      for (const item of cards) excluded.add(item.id);
    }
    expect(excluded.size).toBe(20);
  });

  it("uses only the allowed difficulties", () => {
    const cards = pickRaceCards(pool(10), 5, new Set(), new Set(), Math.random, ["hard"]) ?? [];
    expect(mixOf(cards)).toEqual([0, 0, 5]);
  });

  it("avoids excluded and already played cards while others of the difficulty exist", () => {
    const all = pool(10);
    const excluded = new Set(all.slice(0, 3).map((item) => item.id));
    const played = new Set(all.slice(3, 6).map((item) => item.id));
    const cards = pickRaceCards(all, 10, excluded, played) ?? [];
    expect(cards).toHaveLength(10);
    expect(cards.some((item) => excluded.has(item.id))).toBe(false);
    expect(cards.some((item) => played.has(item.id))).toBe(false);
  });

  it("never fills a difficulty from another one, it gives up instead", () => {
    // Many easy cards but only one hard card: a mix of 10 needs 3 hard cards.
    const small = [
      ...pool(1),
      ...Array.from({ length: 8 }, (_, index) => card(`e${index}`, "easy")),
    ];
    expect(pickRaceCards(small, 10, new Set(), new Set())).toBeUndefined();
    expect(mixOf(pickRaceCards(small, 3, new Set(), new Set()) ?? [])).toEqual([1, 1, 1]);
    expect(pickRaceCards(pool(1), 5, new Set(), new Set())).toBeUndefined();
  });

  it("puts the cards in order from easy to hard, so the hard ones come last", () => {
    for (const random of [() => 0, () => 0.5, () => 0.99, Math.random]) {
      const cards = pickRaceCards(pool(10), 10, new Set(), new Set(), random) ?? [];
      const rank = { easy: 0, medium: 1, hard: 2 } as const;
      const order = cards.map((item) => rank[item.difficulty]);
      expect(order).toEqual([...order].sort((x, y) => x - y));
      expect(mixOf(cards)).toEqual([4, 3, 3]);
    }
  });

  it("picks the same cards with the same random source", () => {
    const fixed = () => 0;
    const first = pickRaceCards(pool(10), 10, new Set(), new Set(), fixed);
    const again = pickRaceCards(pool(10), 10, new Set(), new Set(), fixed);
    expect(first?.map((item) => item.id)).toEqual(again?.map((item) => item.id));
  });
});

describe("pickRaceReplacement", () => {
  it("replaces a card by an unused one of exactly the same difficulty", () => {
    const all = pool(3);
    const replaced = card("easy-0", "easy");
    const replacement = pickRaceReplacement(all, replaced, new Set([replaced.id]), new Set());
    expect(replacement?.difficulty).toBe("easy");
    expect(replacement?.id).not.toBe(replaced.id);
  });

  it("gives nothing when no card of that difficulty is left, even if others are", () => {
    const only = [card("easy-0", "easy"), card("hard-0", "hard")];
    expect(pickRaceReplacement(only, only[0]!, new Set(["easy-0"]), new Set())).toBeUndefined();
  });
});

describe("raceCardShortage", () => {
  it("is fine when every used difficulty has the cards of all runs and two spares per team", () => {
    // 2 teams, 5 cards: easy 2, medium 2, hard 1 -> 8, 8 and 6 cards.
    expect(raceCardShortage(pool(8), 2, 5)).toBeUndefined();
    expect(raceCardShortage(pool(6), 2, 5)).toEqual({
      available: 6,
      difficulty: "easy",
      required: 8,
    });
  });

  it("names the first difficulty that is short", () => {
    const cards = [
      ...Array.from({ length: 20 }, (_, index) => card(`e${index}`, "easy")),
      ...Array.from({ length: 3 }, (_, index) => card(`m${index}`, "medium")),
      ...Array.from({ length: 20 }, (_, index) => card(`h${index}`, "hard")),
    ];
    expect(raceCardShortage(cards, 2, 5)).toEqual({
      available: 3,
      difficulty: "medium",
      required: 8,
    });
  });

  it("only looks at the allowed difficulties", () => {
    const hard = Array.from({ length: 30 }, (_, index) => card(`h${index}`, "hard"));
    expect(raceCardShortage(hard, 3, 5, ["hard"])).toBeUndefined();
    expect(raceCardShortage(hard, 3, 5)).toMatchObject({ difficulty: "easy", available: 0 });
  });
});
