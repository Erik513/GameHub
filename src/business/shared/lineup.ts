import { parsePlayers } from "./players";
import { clampTeamCount, type TeamRules, type TeamSetupValue } from "./teamSetup";

/** Whether a game has a player list: not at all, as a help to see who plays, or as a must. */
export type PlayersMode = "off" | "optional" | "required";

/**
 * What happens at the start to players who were added but are in no team: they are left out
 * (`ignore`, for a game that never needs a name, like Taboo), put into the smallest teams
 * (`assign`, nobody is forgotten) or the start is refused with a message (`block`).
 */
export type UnassignedPlayers = "ignore" | "assign" | "block";

/**
 * What the line-up of a game consists of. A game describes it once: which player list it needs and
 * whether it has teams. Games without teams (everybody plays for himself) set `teams: "off"`, games
 * that do not need the names (like Taboo) set `players: "optional"`.
 */
export interface LineupConfig {
  readonly maxPlayers: number;
  readonly minPlayers: number;
  readonly players: PlayersMode;
  readonly teams: TeamRules | "off";
  /** What happens to players without a team when the game starts. */
  readonly unassignedPlayers: UnassignedPlayers;
}

export const defaultLineup: LineupConfig = {
  maxPlayers: 12,
  minPlayers: 2,
  players: "optional",
  teams: "off",
  unassignedPlayers: "assign",
};

export interface LineupIssue {
  readonly code: "too_few_players" | "too_many_players" | "players_without_team";
  /** The limit that is not kept, or how many players have no team. */
  readonly count: number;
}

/**
 * Checks the line-up before the game starts. Players are counted when the game has a player list.
 * A game that wants every added player in a team (`unassignedPlayers: "block"`) refuses to start
 * while somebody has no team.
 */
export function validateLineup(config: LineupConfig, value: TeamSetupValue): LineupIssue[] {
  const issues: LineupIssue[] = [];
  if (config.players === "off") return issues;
  const players = parsePlayers(value.playersText);
  if (config.players === "required" && players.length < config.minPlayers) {
    issues.push({ code: "too_few_players", count: config.minPlayers });
  }
  if (players.length > config.maxPlayers) {
    issues.push({ code: "too_many_players", count: config.maxPlayers });
  }
  if (config.teams !== "off" && config.unassignedPlayers === "block") {
    const count = clampTeamCount(value.count, config.teams);
    const without = players.filter((player) => {
      const team = value.assignment[player];
      return team === undefined || team >= count;
    });
    if (without.length > 0) issues.push({ code: "players_without_team", count: without.length });
  }
  return issues;
}

/**
 * The line-up as the game gets it: with `assign` the players without a team are put into the teams
 * with the fewest players (the first team when equal), one after the other in alphabetical order, so
 * nobody is forgotten. With `ignore` and `block` nothing changes.
 */
export function resolveLineup(config: LineupConfig, value: TeamSetupValue): TeamSetupValue {
  if (config.teams === "off" || config.unassignedPlayers !== "assign") return value;
  const count = clampTeamCount(value.count, config.teams);
  const assignment = { ...value.assignment };
  const players = parsePlayers(value.playersText);
  const sizes = Array.from(
    { length: count },
    (_, team) => players.filter((player) => assignment[player] === team).length,
  );
  const waiting = players.filter((player) => {
    const team = assignment[player];
    return team === undefined || team >= count;
  });
  for (const player of waiting.sort((a, b) => a.localeCompare(b))) {
    const smallest = Math.min(...sizes);
    const index = sizes.indexOf(smallest);
    assignment[player] = index;
    sizes[index] = smallest + 1;
  }
  return { ...value, assignment };
}
