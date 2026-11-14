import { defaultTeamRules } from "../../shared/teamSetup";
import type { LineupConfig } from "../../shared/lineup";

/**
 * The line-up of Taboo: teams, and a player list that is only there to see who is in which team (the
 * game itself never needs a name), so it is optional and players without a team are left out.
 */
export const tabooLineup: LineupConfig = {
  maxPlayers: 24,
  minPlayers: 0,
  players: "optional",
  teams: defaultTeamRules,
  unassignedPlayers: "ignore",
};
