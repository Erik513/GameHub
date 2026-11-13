import { expect, it } from "vitest";
import { validateCard, type TabooCard } from "../../business/games/taboo/model";
import { cardProblem, splitWords } from "./cardProblem";

const base: Omit<TabooCard, "forbiddenWords"> = {
  id: "1",
  language: "de",
  term: "Fußball",
  categoryId: "x",
  difficulty: "easy",
};

function problemOf(term: string, words: string[]) {
  const result = validateCard({ ...base, term, forbiddenWords: words });
  return result.valid ? undefined : cardProblem(result.issues);
}

it("names the first problem of a card", () => {
  expect(problemOf("", ["a", "b", "c", "d"])).toBe("noTerm");
  expect(problemOf("Tor", ["a", "b", "c"])).toBe("wordCount");
  expect(problemOf("Tor", ["a", "b", "c", "d", "e"])).toBe("wordCount");
  expect(problemOf("Tor", ["Ball", "ball", "Netz", "Keeper"])).toBe("duplicateWord");
  expect(problemOf("Tor", ["Ball", " Ball ", "Netz", "Keeper"])).toBe("duplicateWord");
  expect(problemOf("Tor", ["tor", "Netz", "Ball", "Keeper"])).toBe("sameAsTerm");
  expect(problemOf("Fußball", ["Ball", "Tor", "Rasen", "Stadion"])).toBe("partOfTerm");
  expect(problemOf("Tor", ["Ball", "Netz", "Treffer", "Keeper"])).toBeUndefined();
  // The order decides when there are several problems.
  expect(problemOf("Tor", ["Ball", "Ball", "tor"])).toBe("wordCount");
});

it("splits words at commas and semicolons and ignores empty entries", () => {
  expect(splitWords("a, b; c ,, d,")).toEqual(["a", "b", "c", "d"]);
  expect(splitWords(" , ;")).toEqual([]);
});
