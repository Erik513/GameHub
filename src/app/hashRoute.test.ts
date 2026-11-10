import { describe, expect, it } from "vitest";
import { createRouteHash, homeRoute, parseHashRoute } from "./hashRoute";

describe("hash route", () => {
  it.each([
    ["#/", "/"],
    ["#/games/taboo", "/games/taboo"],
    ["", "/"],
    ["invalid", "/"],
  ])("parses %s as %s", (hash, route) => {
    expect(parseHashRoute(hash)).toBe(route);
  });

  it("creates static-hosting-safe hashes", () => {
    expect(createRouteHash("/games/taboo")).toBe("#/games/taboo");
    expect(createRouteHash("invalid")).toBe(`#${homeRoute}`);
  });
});
