import { describe, expect, it } from "vitest";
import { hasTeamSetupContent, parseSavedTeamSetup, sameTeamSetup } from "./savedTeamSetup";
import { initialTeamSetup, type TeamSetupValue } from "./teamSetup";

const saved: TeamSetupValue = {
  assignment: { Anna: 0, Ben: 1 },
  count: 2,
  names: ["Red", ""],
  order: "entered",
  playersText: "Anna, Ben",
};

describe("hasTeamSetupContent", () => {
  it("is false for an untouched setup and true for a team name or a player", () => {
    expect(hasTeamSetupContent(initialTeamSetup())).toBe(false);
    expect(hasTeamSetupContent({ ...initialTeamSetup(), names: ["  ", ""] })).toBe(false);
    expect(hasTeamSetupContent({ ...initialTeamSetup(), names: ["Red"] })).toBe(true);
    expect(hasTeamSetupContent({ ...initialTeamSetup(), playersText: "Anna" })).toBe(true);
  });
});

describe("sameTeamSetup", () => {
  it("compares every field, ignoring the order of the assignment keys", () => {
    expect(sameTeamSetup(saved, { ...saved, assignment: { Ben: 1, Anna: 0 } })).toBe(true);
    expect(sameTeamSetup(saved, { ...saved, count: 3 })).toBe(false);
    expect(sameTeamSetup(saved, { ...saved, names: ["Red"] })).toBe(false);
    expect(sameTeamSetup(saved, { ...saved, names: ["Blue", ""] })).toBe(false);
    expect(sameTeamSetup(saved, { ...saved, order: "random" })).toBe(false);
    expect(sameTeamSetup(saved, { ...saved, playersText: "Anna" })).toBe(false);
    expect(sameTeamSetup(saved, { ...saved, assignment: { Anna: 1, Ben: 1 } })).toBe(false);
  });
});

describe("parseSavedTeamSetup", () => {
  it("accepts a complete value", () => {
    expect(parseSavedTeamSetup(JSON.parse(JSON.stringify(saved)))).toEqual(saved);
  });

  it.each([
    ["nothing", undefined],
    ["a string", "text"],
    ["null", null],
    ["a fractional count", { ...saved, count: 2.5 }],
    ["a count of zero", { ...saved, count: 0 }],
    ["an absurd count", { ...saved, count: 5000 }],
    ["names that are no text", { ...saved, names: [1] }],
    ["names that are no list", { ...saved, names: "Red" }],
    ["an unknown order", { ...saved, order: "backwards" }],
    ["players that are no text", { ...saved, playersText: 4 }],
    ["an assignment that is a list", { ...saved, assignment: [] }],
    ["a missing assignment", { ...saved, assignment: null }],
    ["a negative team number", { ...saved, assignment: { Anna: -1 } }],
    ["a team number that is no number", { ...saved, assignment: { Anna: "0" } }],
  ])("rejects %s", (_name, value) => {
    expect(parseSavedTeamSetup(value)).toBeUndefined();
  });
});
