import { describe, expect, it } from "vitest";
import {
  buildTeams,
  clampTeamCount,
  defaultTeamRules,
  initialTeamSetup,
  validateTeamSetup,
  type TeamSetupValue,
} from "./teamSetup";

const name = (number: number) => `Team ${number}`;
const value = (overrides: Partial<TeamSetupValue> = {}): TeamSetupValue => ({
  ...initialTeamSetup(),
  ...overrides,
});

describe("initialTeamSetup and clampTeamCount", () => {
  it("starts with the default team count, random order and nobody entered", () => {
    expect(initialTeamSetup()).toEqual({
      assignment: {},
      count: 2,
      names: [],
      order: "random",
      playersText: "",
    });
    expect(initialTeamSetup({ ...defaultTeamRules, defaultTeams: 3 }).count).toBe(3);
  });

  it("keeps the count inside the limits and falls back to the default for bad numbers", () => {
    expect(clampTeamCount(1)).toBe(2);
    expect(clampTeamCount(9)).toBe(6);
    expect(clampTeamCount(3.6)).toBe(4);
    expect(clampTeamCount(Number.NaN)).toBe(2);
    expect(clampTeamCount(10, { ...defaultTeamRules, maxTeams: 4 })).toBe(4);
  });
});

describe("buildTeams", () => {
  it("fills blank names, trims typed ones and keeps the entered order", () => {
    const teams = buildTeams(value({ count: 3, names: [" Red ", "", "Blue"], order: "entered" }), {
      defaultName: name,
    });
    expect(teams).toEqual([
      { id: "1", name: "Red", players: [] },
      { id: "2", name: "Team 2", players: [] },
      { id: "3", name: "Blue", players: [] },
    ]);
  });

  it("assigns the typed players to their teams and ignores unassigned or unknown ones", () => {
    const teams = buildTeams(
      value({
        assignment: { Anna: 0, Ben: 1, Cara: 0, Dora: 5, Ghost: 1 },
        order: "entered",
        playersText: "Anna, Ben\nCara; Dora\nEmil",
      }),
      { defaultName: name },
    );
    expect(teams.map((team) => team.players)).toEqual([["Anna", "Cara"], ["Ben"]]);
  });

  it("draws the order with the injected random source and keeps each team with its players", () => {
    const teams = buildTeams(
      value({ assignment: { Anna: 0, Ben: 1 }, playersText: "Anna, Ben", count: 3 }),
      { defaultName: name, random: () => 0 },
    );
    expect(teams.map((team) => team.id)).toEqual(["2", "3", "1"]);
    expect(teams.find((team) => team.id === "1")?.players).toEqual(["Anna"]);
    expect(teams.find((team) => team.id === "2")?.players).toEqual(["Ben"]);
  });

  it("clamps the count to the rules of the game", () => {
    expect(buildTeams(value({ count: 99, order: "entered" }), { defaultName: name })).toHaveLength(
      6,
    );
    expect(
      buildTeams(
        value({ count: 1, order: "entered" }),
        { defaultName: name },
        { ...defaultTeamRules, minTeams: 3 },
      ),
    ).toHaveLength(3);
  });
});

describe("validateTeamSetup", () => {
  it("accepts a normal setup", () => {
    expect(validateTeamSetup(value({ count: 4, names: ["a", "b"] }))).toEqual([]);
  });

  it("reports a team count outside the limits or not a whole number", () => {
    expect(validateTeamSetup(value({ count: 1 }))).toEqual([
      { code: "team_count", field: "count" },
    ]);
    expect(validateTeamSetup(value({ count: 7 }))).toEqual([
      { code: "team_count", field: "count" },
    ]);
    expect(validateTeamSetup(value({ count: 2.5 }))).toEqual([
      { code: "team_count", field: "count" },
    ]);
  });

  it("reports names that are too long, only for the teams that exist", () => {
    const long = "x".repeat(25);
    const issues = validateTeamSetup(value({ count: 2, names: ["ok", long, long] }));
    expect(issues).toEqual([{ code: "name_too_long", field: "names.1" }]);
    expect(validateTeamSetup(value({ names: ["x".repeat(24)] }))).toEqual([]);
  });

  it("asks for a player in every team only when players are required", () => {
    const entered = value({ assignment: { Anna: 0 }, playersText: "Anna", count: 2 });
    expect(validateTeamSetup(entered)).toEqual([]);
    expect(validateTeamSetup(entered, defaultTeamRules, { playersRequired: true })).toEqual([
      { code: "players_missing", field: "teams.1" },
    ]);
    expect(
      validateTeamSetup(value({ count: Number.NaN }), defaultTeamRules, { playersRequired: true }),
    ).toEqual([{ code: "team_count", field: "count" }]);
  });
});
