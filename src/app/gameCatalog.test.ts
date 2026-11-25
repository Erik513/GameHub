import { describe, expect, it } from "vitest";
import { findGameByRoute, gameCatalog, isGameOpenable } from "./gameCatalog";

describe("game catalog", () => {
  it("contains unique IDs and routes", () => {
    const ids = gameCatalog.map((game) => game.id);
    const routes = gameCatalog.map((game) => game.route);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(routes).size).toBe(routes.length);
  });

  it("uses genre-independent metadata for every game", () => {
    for (const game of gameCatalog) {
      expect(game.id).toMatch(/^[a-z0-9-]+$/);
      expect(game.route).toBe(`/games/${game.id}`);
      expect(["available", "preview", "planned"]).toContain(game.availability);
    }
  });

  it("opens finished games and games in development, planned games never", () => {
    expect(isGameOpenable({ availability: "available" })).toBe(true);
    // A game in development can be played in the published app, too (it keeps its label).
    expect(isGameOpenable({ availability: "preview" })).toBe(true);
    expect(isGameOpenable({ availability: "planned" })).toBe(false);
  });

  it("finds registered games by route", () => {
    expect(findGameByRoute("/games/taboo")?.id).toBe("taboo");
    expect(findGameByRoute("/games/unknown")).toBeUndefined();
  });
});
