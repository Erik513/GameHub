import { describe, expect, it } from "vitest";
import { shuffle } from "./shuffle";

describe("shuffle", () => {
  const items = [1, 2, 3, 4, 5];

  it("is a permutation and does not change its input", () => {
    const input = [...items];
    const result = shuffle(input);
    expect(input).toEqual(items);
    expect([...result].sort()).toEqual(items);
  });

  it("follows the injected random source", () => {
    expect(shuffle(items, () => 0.99)).toEqual(items);
    expect(shuffle(items, () => 0)).toEqual([2, 3, 4, 5, 1]);
  });

  it("produces every ordering of three items over many runs", () => {
    const seen = new Set<string>();
    for (let run = 0; run < 400; run += 1) seen.add(shuffle([1, 2, 3]).join(""));
    expect(seen.size).toBe(6);
  });
});
