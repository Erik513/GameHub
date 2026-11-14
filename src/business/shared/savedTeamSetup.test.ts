import { describe, expect, it } from "vitest";
import { hasTeamSetupContent, parseSavedTeamSetup, sameTeamSetup } from "./savedTeamSetup";
import { initialTeamSetup, type TeamSetupValue } from "./teamSetup";

const saved: TeamSetupValue = {
  assignment: { Anna: 0, Ben: 1 },
  count: 2,
  names: ["Red", ""],
  order: [1, 0],
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
    expect(sameTeamSetup(saved, { ...saved, order: [0, 1] })).toBe(false);
    // An order that only says "normal" is the same as the written out normal order.
    expect(sameTeamSetup({ ...saved, order: [] }, { ...saved, order: [0, 1] })).toBe(true);
    expect(sameTeamSetup(saved, { ...saved, playersText: "Anna" })).toBe(false);
    expect(sameTeamSetup(saved, { ...saved, assignment: { Anna: 1, Ben: 1 } })).toBe(false);
  });
});

describe("parseSavedTeamSetup", () => {
  it("reads the words that an older version saved for the order as the normal order", () => {
    for (const old of ["random", "entered"]) {
      expect(parseSavedTeamSetup({ ...saved, order: old })?.order).toEqual([]);
    }
    expect(parseSavedTeamSetup({ ...saved, order: [1, 0] })?.order).toEqual([1, 0]);
  });

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
    ["an order with something that is no team", { ...saved, order: [1, "a"] }],
    ["an order with a negative team", { ...saved, order: [-1] }],
    ["players that are no text", { ...saved, playersText: 4 }],
    ["an assignment that is a list", { ...saved, assignment: [] }],
    ["a missing assignment", { ...saved, assignment: null }],
    ["a negative team number", { ...saved, assignment: { Anna: -1 } }],
    ["a team number that is no number", { ...saved, assignment: { Anna: "0" } }],
  ])("rejects %s", (_name, value) => {
    expect(parseSavedTeamSetup(value)).toBeUndefined();
  });
});
