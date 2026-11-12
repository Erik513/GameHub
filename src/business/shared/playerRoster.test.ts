import { describe, expect, it } from "vitest";
import {
  addPlayer,
  capitalizePlayerName,
  applyRosterSelection,
  maxPlayerNameLength,
  maxRosterPlayers,
  normalizePlayerName,
  parseSavedRoster,
  removePlayer,
  rosterPlayersIn,
} from "./playerRoster";

describe("normalizePlayerName", () => {
  it("trims and collapses white space", () => {
    expect(normalizePlayerName("  Anna   Maria \n")).toBe("Anna Maria");
  });
});

describe("capitalizePlayerName", () => {
  it("makes only the first letter a capital letter", () => {
    expect(capitalizePlayerName("anna maria")).toBe("Anna maria");
    expect(capitalizePlayerName("eMMa")).toBe("EMMa");
    expect(capitalizePlayerName("élodie")).toBe("Élodie");
    expect(capitalizePlayerName("")).toBe("");
  });
});

describe("addPlayer", () => {
  it("adds a name and keeps the list sorted", () => {
    const first = addPlayer([], " Cara ");
    expect(first).toEqual({ ok: true, roster: ["Cara"] });
    const second = addPlayer(["Cara"], "anna");
    // The first letter becomes a capital letter.
    expect(second).toEqual({ ok: true, roster: ["Anna", "Cara"] });
  });

  it("refuses empty, duplicate, too long and separated names and a full list", () => {
    expect(addPlayer([], "   ")).toEqual({ ok: false, reason: "empty" });
    expect(addPlayer(["Anna"], "ANNA")).toEqual({ ok: false, reason: "duplicate" });
    expect(addPlayer([], "x".repeat(maxPlayerNameLength + 1))).toEqual({
      ok: false,
      reason: "invalid",
    });
    expect(addPlayer([], "Anna, Ben")).toEqual({ ok: false, reason: "invalid" });
    expect(addPlayer([], "Anna;Ben")).toEqual({ ok: false, reason: "invalid" });
    const full = Array.from({ length: maxRosterPlayers }, (_, index) => `P${index}`);
    expect(addPlayer(full, "Extra")).toEqual({ ok: false, reason: "full" });
  });
});

describe("removePlayer", () => {
  it("removes exactly the given name", () => {
    expect(removePlayer(["Anna", "Ben"], "Ben")).toEqual(["Anna"]);
    expect(removePlayer(["Anna"], "Cara")).toEqual(["Anna"]);
  });
});

describe("parseSavedRoster", () => {
  it("keeps valid unique names and drops everything else", () => {
    expect(parseSavedRoster(["Ben", "Anna", "anna", 3, "", "a,b", null])).toEqual(["Anna", "Ben"]);
    expect(parseSavedRoster("Anna")).toEqual([]);
    expect(parseSavedRoster(undefined)).toEqual([]);
  });
});

describe("applyRosterSelection", () => {
  const roster = ["Anna", "Ben", "Cara"];

  it("adds chosen players and keeps hand-typed names", () => {
    expect(applyRosterSelection("Dora", roster, new Set(["Anna", "Ben"]))).toBe("Dora, Anna, Ben");
  });

  it("removes deselected players of the list but keeps other names", () => {
    expect(applyRosterSelection("Anna, Dora, ben", roster, new Set(["Anna"]))).toBe("Anna, Dora");
  });

  it("does not add a chosen player twice", () => {
    expect(applyRosterSelection("anna", roster, new Set(["Anna", "Cara"]))).toBe("anna, Cara");
  });
});

describe("rosterPlayersIn", () => {
  it("finds the players of the list that are in the text, ignoring case", () => {
    expect([...rosterPlayersIn("anna, Dora", ["Anna", "Ben"])]).toEqual(["Anna"]);
  });
});
