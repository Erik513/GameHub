import { describe, expect, it } from "vitest";
import type { Difficulty, TabooCard } from "./model";
import { pickTiebreakCard, pickTiebreakCards } from "./tiebreakCards";

function card(id: string, difficulty: Difficulty): TabooCard {
  return {
    id,
    term: id,
    forbiddenWords: ["a", "b", "c", "d"],
    language: "en",
    difficulty,
    categoryId: "x",
  };
}

const pool = [
  card("e1", "easy"),
  card("e2", "easy"),
  card("m1", "medium"),
  card("h1", "hard"),
  card("h2", "hard"),
];

describe("tiebreak card selection", () => {
  it("picks one card per difficulty, avoiding excluded and preferring unplayed cards", () => {
    const cards = pickTiebreakCards(pool, new Set(["e1"]), new Set(["h1"]), () => 0);
    expect(cards?.map((c) => c.id)).toEqual(["e2", "m1", "h2"]);
  });

  it("falls back to played cards when everything of that difficulty was played", () => {
    const picked = pickTiebreakCard(pool, "hard", new Set(), new Set(["h1", "h2"]), () => 0.99);
    expect(picked?.id).toBe("h2");
  });

  it("uses any unused card when the difficulty does not exist in the pool", () => {
    const onlyEasy = [card("e1", "easy"), card("e2", "easy"), card("e3", "easy")];
    expect(
      pickTiebreakCards(onlyEasy, new Set(), new Set())
        ?.map((c) => c.id)
        .sort(),
    ).toEqual(["e1", "e2", "e3"]);
  });

  it("returns nothing when there are not enough cards", () => {
    expect(pickTiebreakCards(pool.slice(0, 2), new Set(), new Set())).toBeUndefined();
    expect(pickTiebreakCard([], "easy", new Set(), new Set())).toBeUndefined();
  });
});
