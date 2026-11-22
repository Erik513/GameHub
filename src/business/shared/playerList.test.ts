import { describe, expect, it } from "vitest";
import { addPlayersToText, removePlayerFromText, duplicatePlayerNames } from "./playerList";

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

describe("duplicatePlayerNames", () => {
  it("names the typed players that are in the list already, ignoring case, each once", () => {
    expect(duplicatePlayerNames("Anna, Ben", "anna, Cleo; ANNA")).toEqual(["Anna"]);
    expect(duplicatePlayerNames("Anna", "Ben")).toEqual([]);
  });
});
