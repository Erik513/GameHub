import { describe, expect, it } from "vitest";
import { addPlayersToText, removePlayerFromText, smallestTeamIndex } from "./playerList";

describe("addPlayersToText", () => {
  it("adds a name with a capital first letter", () => {
    expect(addPlayersToText("", "anna")).toBe("Anna");
    expect(addPlayersToText("Anna", "  ben  ")).toBe("Anna\nBen");
  });

  it("adds several names typed with commas, semicolons or line breaks", () => {
    expect(addPlayersToText("Anna", "ben, clara;david\neva")).toBe("Anna\nBen\nClara\nDavid\nEva");
  });

  it("skips empty names, names in the list (any case) and names that are too long", () => {
    expect(addPlayersToText("Anna", " , ANNA , anna")).toBe("Anna");
    expect(addPlayersToText("Anna", "x".repeat(25))).toBe("Anna");
    expect(addPlayersToText("Anna", "x".repeat(24))).toBe(`Anna\n${"X" + "x".repeat(23)}`);
  });

  it("cleans a list that was typed by hand", () => {
    expect(addPlayersToText("Anna, Ben,,", "Clara")).toBe("Anna\nBen\nClara");
  });
});

describe("removePlayerFromText", () => {
  it("removes a player whatever the case", () => {
    expect(removePlayerFromText("Anna\nBen\nClara", "ben")).toBe("Anna\nClara");
    expect(removePlayerFromText("Anna", "Ben")).toBe("Anna");
    expect(removePlayerFromText("Anna", "Anna")).toBe("");
  });
});

describe("smallestTeamIndex", () => {
  it("returns the team with the fewest players, the first one when equal", () => {
    expect(smallestTeamIndex({}, 3)).toBe(0);
    expect(smallestTeamIndex({ Anna: 0 }, 3)).toBe(1);
    expect(smallestTeamIndex({ Anna: 0, Ben: 1 }, 3)).toBe(2);
    expect(smallestTeamIndex({ Anna: 0, Ben: 1, Clara: 2 }, 3)).toBe(0);
    expect(smallestTeamIndex({ Anna: 0, Ben: 0, Clara: 1 }, 2)).toBe(1);
  });

  it("ignores players of teams that do not exist and answers nothing without teams", () => {
    expect(smallestTeamIndex({ Anna: 5 }, 2)).toBe(0);
    expect(smallestTeamIndex({}, 0)).toBeUndefined();
  });
});
