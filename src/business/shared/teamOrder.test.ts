import { describe, expect, it } from "vitest";
import { shuffleTeams } from "./teamOrder";

describe("shuffleTeams", () => {
  const teams = ["a", "b", "c", "d"];

  it("keeps the order when the random source always picks the last slot", () => {
    expect(shuffleTeams(teams, () => 0.99)).toEqual(teams);
  });

  it("reorders deterministically for a given random source", () => {
    expect(shuffleTeams(teams, () => 0)).toEqual(["b", "c", "d", "a"]);
  });

  it("returns a permutation without mutating the input", () => {
    const input = [...teams];
    const result = shuffleTeams(input);
    expect(input).toEqual(teams);
    expect([...result].sort()).toEqual(teams);
  });

  it("handles empty and single-team lists", () => {
    expect(shuffleTeams([])).toEqual([]);
    expect(shuffleTeams(["solo"])).toEqual(["solo"]);
  });
});
