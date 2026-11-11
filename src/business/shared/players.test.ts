import { describe, expect, it } from "vitest";
import { parsePlayers, splitIntoTeams } from "./players";

describe("parsePlayers", () => {
  it("splits on lines, commas and semicolons, trims and drops blanks and duplicates", () => {
    expect(parsePlayers(" Anna, ben\n\nCara;anna \n Dora ")).toEqual([
      "Anna",
      "ben",
      "Cara",
      "Dora",
    ]);
  });

  it("returns an empty list for blank text", () => {
    expect(parsePlayers("  \n , ")).toEqual([]);
  });
});

describe("splitIntoTeams", () => {
  const players = ["A", "B", "C", "D", "E"];

  it("assigns every player exactly once and keeps team sizes within one", () => {
    const teams = splitIntoTeams(players, 2, () => 0.3);
    expect(teams).toHaveLength(2);
    expect([...teams.flat()].sort()).toEqual(players);
    expect(Math.abs((teams[0]?.length ?? 0) - (teams[1]?.length ?? 0))).toBeLessThanOrEqual(1);
  });

  it("is deterministic for a fixed random source", () => {
    expect(splitIntoTeams(players, 3, () => 0)).toEqual(splitIntoTeams(players, 3, () => 0));
  });

  it("handles fewer players than teams and invalid counts", () => {
    expect(splitIntoTeams(["A"], 3)).toEqual([["A"], [], []]);
    expect(splitIntoTeams(players, 0)).toEqual([]);
  });
});
