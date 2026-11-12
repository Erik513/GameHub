import { parsePlayers } from "./players";
import { shuffleTeams } from "./teamOrder";

/** How the teams are put in order for the game: drawn at random or as the player typed them. */
export type TeamOrderMode = "random" | "entered";

/** The limits a game sets for its teams. */
export interface TeamRules {
  readonly defaultTeams: number;
  readonly maxNameLength: number;
  readonly maxTeams: number;
  readonly minTeams: number;
}

export const defaultTeamRules: TeamRules = {
  defaultTeams: 2,
  maxNameLength: 24,
  maxTeams: 6,
  minTeams: 2,
};

/** Everything the player entered about teams and players on the setup screen. */
export interface TeamSetupValue {
  /** Which team (0-based) a player belongs to; players are the names in `playersText`. */
  readonly assignment: Readonly<Record<string, number>>;
  readonly count: number;
  /** One entry per team, empty when the player left the name blank. */
  readonly names: readonly string[];
  readonly order: TeamOrderMode;
  /** The player names as typed (one per line or separated by commas). */
  readonly playersText: string;
}

/** A team as the game gets it, in playing order. */
export interface SetupTeam {
  readonly id: string;
  readonly name: string;
  readonly players: readonly string[];
}

export function initialTeamSetup(rules: TeamRules = defaultTeamRules): TeamSetupValue {
  return {
    assignment: {},
    count: rules.defaultTeams,
    names: [],
    order: "random",
    playersText: "",
  };
}

/** Keeps a team count inside the limits of the game. */
export function clampTeamCount(count: number, rules: TeamRules = defaultTeamRules): number {
  if (!Number.isFinite(count)) return rules.defaultTeams;
  return Math.min(rules.maxTeams, Math.max(rules.minTeams, Math.round(count)));
}

/**
 * Builds the teams for the game from what was entered. Blank names become `defaultName(number)`,
 * the players are the ones assigned to each team (players without a team belong to none), and the
 * result is in playing order: drawn at random or as entered. The random source is injected.
 */
export function buildTeams(
  value: TeamSetupValue,
  options: { readonly defaultName: (number: number) => string; readonly random?: () => number },
  rules: TeamRules = defaultTeamRules,
): SetupTeam[] {
  const count = clampTeamCount(value.count, rules);
  const players = parsePlayers(value.playersText);
  const entered: SetupTeam[] = Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    name: (value.names[index] ?? "").trim() || options.defaultName(index + 1),
    players: players.filter((player) => value.assignment[player] === index),
  }));
  return value.order === "random" ? shuffleTeams(entered, options.random) : entered;
}

export interface TeamSetupIssue {
  readonly code: "team_count" | "name_too_long" | "players_missing";
  readonly field: string;
}

/**
 * Checks the entered values against the rules of the game. With `playersRequired` every team needs
 * at least one player. A name that is too long is reported, never cut off silently.
 */
export function validateTeamSetup(
  value: TeamSetupValue,
  rules: TeamRules = defaultTeamRules,
  options: { readonly playersRequired?: boolean } = {},
): TeamSetupIssue[] {
  const issues: TeamSetupIssue[] = [];
  if (
    !Number.isInteger(value.count) ||
    value.count < rules.minTeams ||
    value.count > rules.maxTeams
  ) {
    issues.push({ code: "team_count", field: "count" });
  }
  value.names.slice(0, value.count).forEach((name, index) => {
    if (name.trim().length > rules.maxNameLength) {
      issues.push({ code: "name_too_long", field: `names.${index}` });
    }
  });
  if (options.playersRequired) {
    const players = parsePlayers(value.playersText);
    for (let index = 0; index < Math.max(0, Math.floor(value.count)); index += 1) {
      if (!players.some((player) => value.assignment[player] === index)) {
        issues.push({ code: "players_missing", field: `teams.${index}` });
      }
    }
  }
  return issues;
}
