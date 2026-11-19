import { parsePlayers } from "../../shared/players";
import { resolveAutomaticWerewolfLineup } from "./automaticSetup";
import { createCheckedWerewolf } from "./balancedSetup";
import {
  standardWerewolfCount,
  validWerewolfRoles,
  type WerewolfSettings,
  type WerewolfSpecialRole,
} from "./configuration";

/** Preserves the selected legal wolf count; the balance result remains a separate recommendation. */
export function resolveFixedWerewolfLineup(
  players: number,
  roles: readonly WerewolfSpecialRole[],
  settings: Partial<WerewolfSettings> = {},
) {
  const wolfCount = settings.wolfCount ?? standardWerewolfCount(players);
  const recommended = resolveAutomaticWerewolfLineup(players, roles, settings);
  if (!recommended || !validWerewolfRoles(players, roles, wolfCount)) return null;
  return {
    ...recommended,
    settings: { ...recommended.settings, wolfCount },
  };
}

/** Starts one private fixed-role match without replacing the user's wolf selection. */
export function createFixedWerewolf(
  playersText: string,
  narrator: string,
  random: () => number,
  roles: readonly WerewolfSpecialRole[],
  settings: Partial<WerewolfSettings> = {},
) {
  const lineup = resolveFixedWerewolfLineup(parsePlayers(playersText).length, roles, settings);
  return lineup
    ? createCheckedWerewolf(playersText, narrator, random, lineup.roles, lineup.settings)
    : null;
}
