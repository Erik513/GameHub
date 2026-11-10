import { describe, expect, it } from "vitest";
import { findGameByRoute, gameCatalog } from "./gameCatalog";

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

  it("finds registered games by route", () => {
    expect(findGameByRoute("/games/taboo")?.id).toBe("taboo");
    expect(findGameByRoute("/games/unknown")).toBeUndefined();
  });
});
