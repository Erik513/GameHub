import { describe, expect, it } from "vitest";
import { defaultLineup, resolveLineup, validateLineup, type LineupConfig } from "./lineup";
import { defaultTeamRules, initialTeamSetup, type TeamSetupValue } from "./teamSetup";

const value = (patch: Partial<TeamSetupValue> = {}): TeamSetupValue => ({
  ...initialTeamSetup(),
  ...patch,
});
const config = (patch: Partial<LineupConfig> = {}): LineupConfig => ({
  ...defaultLineup,
  ...patch,
});

describe("validateLineup", () => {
  it("accepts a game without a player list whatever was typed", () => {
    expect(validateLineup(config({ players: "off" }), value({ playersText: "A, B" }))).toEqual([]);
  });

  it("asks for the minimum only when players are required", () => {
    const few = value({ playersText: "Anna" });
    expect(validateLineup(config({ players: "required", minPlayers: 3 }), few)).toEqual([
      { code: "too_few_players", count: 3 },
    ]);
    expect(validateLineup(config({ players: "optional", minPlayers: 3 }), few)).toEqual([]);
    expect(
      validateLineup(config({ players: "required", minPlayers: 1 }), value({ playersText: "A" })),
    ).toEqual([]);
  });

  it("limits the number of players", () => {
    const many = value({ playersText: "A\nB\nC" });
    expect(validateLineup(config({ maxPlayers: 2 }), many)).toEqual([
      { code: "too_many_players", count: 2 },
    ]);
  });

  it("wants every player in a team only when the game blocks the start for it", () => {
    const teams = config({ teams: defaultTeamRules, unassignedPlayers: "block" });
    const setup = value({
      assignment: { Anna: 0, Cara: 5 },
      count: 2,
      playersText: "Anna\nBen\nCara",
    });
    // Ben has no team and Cara belongs to a team that does not exist.
    expect(validateLineup(teams, setup)).toEqual([{ code: "players_without_team", count: 2 }]);
    expect(
      validateLineup(teams, value({ assignment: { Anna: 1 }, count: 2, playersText: "Anna" })),
    ).toEqual([]);
    expect(validateLineup(teams, value())).toEqual([]);
    // Left out or put into teams by the game: the start is never refused for it.
    for (const mode of ["ignore", "assign"] as const) {
      expect(validateLineup({ ...teams, unassignedPlayers: mode }, setup)).toEqual([]);
    }
  });

  it("does not look at teams for a game where everybody plays alone", () => {
    expect(validateLineup(config({ teams: "off" }), value({ playersText: "Anna" }))).toEqual([]);
  });
});

describe("resolveLineup", () => {
  const teams = config({ teams: defaultTeamRules, unassignedPlayers: "assign" });

  it("puts players without a team into the smallest teams, in alphabetical order", () => {
    const setup = value({
      assignment: { Anna: 0, Ben: 0 },
      count: 3,
      playersText: "Anna\nBen\nDora\nCara\nEmil",
    });
    // Team 2 and team 3 are empty: Cara goes to team 2, Dora to team 3, Emil to team 2 again.
    expect(resolveLineup(teams, setup).assignment).toEqual({
      Anna: 0,
      Ben: 0,
      Cara: 1,
      Dora: 2,
      Emil: 1,
    });
  });

  it("also takes players whose team does not exist any more", () => {
    const setup = value({ assignment: { Anna: 5 }, count: 2, playersText: "Anna" });
    expect(resolveLineup(teams, setup).assignment).toEqual({ Anna: 0 });
  });

  it("changes nothing for `ignore`, `block` and games without teams", () => {
    const setup = value({ playersText: "Anna" });
    expect(resolveLineup({ ...teams, unassignedPlayers: "ignore" }, setup)).toBe(setup);
    expect(resolveLineup({ ...teams, unassignedPlayers: "block" }, setup)).toBe(setup);
    expect(resolveLineup(config({ teams: "off" }), setup)).toBe(setup);
  });
});
