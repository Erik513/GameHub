import { describe, expect, it } from "vitest";
import { forgetCards, freshDeck, rememberCards } from "./playedCards";

const card = (id: string) => ({ id });

describe("rememberCards", () => {
  it("adds new cards at the end and keeps every card once", () => {
    expect(rememberCards(["a"], ["b", "a", "c", "b"])).toEqual(["a", "b", "c"]);
  });

  it("returns the same list when nothing is new", () => {
    const remembered = ["a", "b"];
    expect(rememberCards(remembered, ["b", "a"])).toBe(remembered);
    expect(rememberCards(remembered, [])).toBe(remembered);
  });

  it("forgets the oldest cards beyond the limit", () => {
    expect(rememberCards(["a", "b", "c"], ["d", "e"], 4)).toEqual(["b", "c", "d", "e"]);
  });
});

describe("forgetCards", () => {
  it("removes the given cards and keeps the others in order", () => {
    expect(forgetCards(["a", "b", "c", "d"], ["b", "d", "x"])).toEqual(["a", "c"]);
  });
});

describe("freshDeck", () => {
  const deck = ["a", "b", "c", "d"].map(card);

  it("takes all cards when none was played", () => {
    expect(freshDeck(deck, [], () => false)).toEqual({ cards: deck, restarted: false });
    // Cards that are not in the deck do not matter.
    expect(freshDeck(deck, ["x"], () => false)).toEqual({ cards: deck, restarted: false });
  });

  it("takes only the unplayed cards when they are enough", () => {
    const result = freshDeck(deck, ["a", "b"], (cards) => cards.length >= 2);
    expect(result.cards.map((c) => c.id)).toEqual(["c", "d"]);
    expect(result.restarted).toBe(false);
  });

  it("starts a new round of the cards when the unplayed ones are not enough", () => {
    const result = freshDeck(deck, ["a", "b", "c"], (cards) => cards.length >= 2);
    expect(result).toEqual({ cards: deck, restarted: true });
    // Even when every card was played.
    expect(freshDeck(deck, ["a", "b", "c", "d"], (cards) => cards.length > 0).restarted).toBe(true);
  });
});
