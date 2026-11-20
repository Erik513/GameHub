import { parsePlayers } from "../../shared/players";
import {
  drawAutomaticWerewolfLineup,
  resolveAutomaticWerewolfLineup,
  type AutomaticWerewolfLineup,
} from "./automaticSetup";
import { createWerewolf, type WerewolfState } from "./stateMachine";
import type { WerewolfSettings, WerewolfSpecialRole } from "./configuration";

export function createBalancedWerewolf(
  playersText: string,
  narrator: string,
  random: () => number,
  roles: readonly WerewolfSpecialRole[],
  settings: Partial<WerewolfSettings> = {},
): WerewolfState | null {
  const lineup = resolveAutomaticWerewolfLineup(parsePlayers(playersText).length, roles, settings);
  if (!lineup) return null;
  return createResolvedWerewolf(playersText, narrator, random, lineup);
}

/** The returned match contains private role information and belongs to the narrator. */
export function createRandomWerewolf(
  playersText: string,
  narrator: string,
  random: () => number,
  pool: readonly WerewolfSpecialRole[],
  roleCount: number,
  settings: Partial<WerewolfSettings> = {},
): WerewolfState | null {
  const players = parsePlayers(playersText);
  if (
    !narrator.trim() ||
    players.some((player) => player.toLocaleLowerCase() === narrator.trim().toLocaleLowerCase())
  )
    return null;
  const lineup = drawAutomaticWerewolfLineup(players.length, pool, roleCount, random, settings);
  if (!lineup) return null;
  const game = createResolvedWerewolf(playersText, narrator, random, lineup);
  return game ? { ...game, nightRolePool: [...pool] } : null;
}

/** Validates every random draw, including shuffle, drunk and amulet assignment. */
export function createResolvedWerewolf(
  playersText: string,
  narrator: string,
  random: () => number,
  lineup: AutomaticWerewolfLineup,
): WerewolfState | null {
  return createCheckedWerewolf(playersText, narrator, random, lineup.roles, {
    ...lineup.settings,
    wolfCount: lineup.balance.recommendedWolfCount,
  });
}

/** Shared private factory; callers validate setup policy before entering this function. */
export function createCheckedWerewolf(
  playersText: string,
  narrator: string,
  random: () => number,
  roles: readonly WerewolfSpecialRole[],
  settings: Partial<WerewolfSettings>,
): WerewolfState | null {
  let invalid = false;
  const checkedRandom = () => {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) {
      invalid = true;
      return 0;
    }
    return value;
  };
  const match = createWerewolf(playersText, narrator, checkedRandom, roles, settings);
  return invalid ? null : match;
}
