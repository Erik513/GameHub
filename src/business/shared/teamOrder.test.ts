import { describe, expect, it } from "vitest";
import { isDefaultOrder, moveTeam, normalizeOrder, randomOrder } from "./teamOrder";

describe("normalizeOrder", () => {
  it("turns an empty order into team 1, team 2, team 3", () => {
    expect(normalizeOrder([], 3)).toEqual([0, 1, 2]);
  });

  it("keeps the given order and adds the teams that are missing", () => {
    expect(normalizeOrder([2], 3)).toEqual([2, 0, 1]);
    expect(normalizeOrder([1, 0], 3)).toEqual([1, 0, 2]);
  });

  it("drops teams that do not exist, repeated teams and things that are no team", () => {
    expect(normalizeOrder([5, 1, 1, -1, 0.5, 0], 3)).toEqual([1, 0, 2]);
    expect(normalizeOrder([0, 1, 2], 2)).toEqual([0, 1]);
  });
});

describe("isDefaultOrder", () => {
  it("is true for the normal order, also when it is only implied", () => {
    expect(isDefaultOrder([], 3)).toBe(true);
    expect(isDefaultOrder([0, 1, 2], 3)).toBe(true);
    expect(isDefaultOrder([1, 0, 2], 3)).toBe(false);
    expect(isDefaultOrder([2], 3)).toBe(false);
  });
});

describe("moveTeam", () => {
  it("moves a team to another place and the teams in between by one place", () => {
    expect(moveTeam([], 4, 3, 0)).toEqual([3, 0, 1, 2]);
    expect(moveTeam([], 4, 0, 2)).toEqual([1, 2, 0, 3]);
    expect(moveTeam([2, 0, 1], 3, 1, 2)).toEqual([2, 1, 0]);
  });

  it("changes nothing for the same place or a place that does not exist", () => {
    expect(moveTeam([1, 0], 2, 1, 1)).toEqual([1, 0]);
    expect(moveTeam([1, 0], 2, 0, 5)).toEqual([1, 0]);
    expect(moveTeam([1, 0], 2, -1, 0)).toEqual([1, 0]);
  });
});

describe("randomOrder", () => {
  it("returns every team once, in an order that depends on the random source", () => {
    const result = randomOrder(4);
    expect([...result].sort()).toEqual([0, 1, 2, 3]);
    expect(randomOrder(4, () => 0.99)).toEqual([0, 1, 2, 3]);
    expect(randomOrder(4, () => 0)).toEqual([1, 2, 3, 0]);
  });

  it("copes with no teams", () => {
    expect(randomOrder(0)).toEqual([]);
  });
});
