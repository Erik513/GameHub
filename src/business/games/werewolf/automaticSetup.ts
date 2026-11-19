import {
  availableWerewolfCounts,
  availableWerewolfRoles,
  standardWerewolfCount,
  validWerewolfRoles,
  type WerewolfSettings,
  type WerewolfSpecialRole,
} from "./configuration";
import { evaluateWerewolfLineup, type WerewolfBalance } from "./lineupBalance";

export interface AutomaticWerewolfLineup {
  readonly roles: readonly WerewolfSpecialRole[];
  readonly settings: Partial<WerewolfSettings>;
  readonly balance: WerewolfBalance;
}

/** Copies supported party options; client-provided wolf counts never enter the automatic path. */
export function automaticWerewolfSettings(
  settings: Partial<WerewolfSettings>,
): Partial<WerewolfSettings> | null {
  const result = {
    mayor: settings.mayor ?? "doubleVote",
    hunterShot: settings.hunterShot ?? "optional",
    allowSelfSilence: settings.allowSelfSilence ?? false,
    revealRoles: settings.revealRoles ?? true,
    drunk: settings.drunk ?? false,
    tanner: settings.tanner ?? "anyDeath",
    amulet: settings.amulet ?? false,
    attackOnFirstNight: settings.attackOnFirstNight ?? false,
  };
  if (
    !["doubleVote", "hammer"].includes(result.mayor) ||
    !["optional", "required"].includes(result.hunterShot) ||
    !["anyDeath", "voteOnly"].includes(result.tanner) ||
    [
      result.allowSelfSilence,
      result.revealRoles,
      result.drunk,
      result.amulet,
      result.attackOnFirstNight,
    ].some((value) => typeof value !== "boolean")
  )
    return null;
  return result;
}

/** Boundary corrections, checked against archived plain and strong small-table lineups. */
export const automaticWerewolfTargets: Readonly<Partial<Record<number, number>>> = {
  7: -4,
  8: -4,
  11: -7,
};

export function resolveAutomaticWerewolfLineup(
  players: number,
  roles: readonly WerewolfSpecialRole[],
  settings: Partial<WerewolfSettings> = {},
): AutomaticWerewolfLineup | null {
  const normalized = automaticWerewolfSettings(settings);
  if (!normalized) return null;
  const orderedRoles = [...roles].sort();
  const ratings = availableWerewolfCounts(players).flatMap((wolfCount) => {
    const rating = evaluateWerewolfLineup(players, orderedRoles, { ...normalized, wolfCount });
    if (!rating) return [];
    const candidate = rating.candidates[0]!;
    const correction = automaticWerewolfTargets[players];
    const villageTarget =
      correction === undefined ? candidate.villageTarget : correction + 7 * wolfCount;
    return [
      {
        rating,
        candidate: {
          ...candidate,
          villageTarget,
          difference: rating.villagePoints - villageTarget,
        },
      },
    ];
  });
  ratings.sort(
    (a, b) =>
      Math.abs(a.candidate.difference) - Math.abs(b.candidate.difference) ||
      Math.abs(a.candidate.wolfCount - standardWerewolfCount(players)) -
        Math.abs(b.candidate.wolfCount - standardWerewolfCount(players)) ||
      a.candidate.wolfCount - b.candidate.wolfCount,
  );
  const chosen = ratings[0];
  if (!chosen) return null;
  return {
    roles: orderedRoles,
    settings: normalized,
    balance: {
      ...chosen.rating,
      evidence: "provisional",
      recommendedWolfCount: chosen.candidate.wolfCount,
      candidates: ratings.map((r) => r.candidate),
    },
  };
}

export function validAutomaticRolePool(
  players: number,
  pool: readonly WerewolfSpecialRole[],
): boolean {
  const available = availableWerewolfRoles(players);
  return (
    availableWerewolfCounts(players).length > 0 &&
    pool.length <= 13 &&
    new Set(pool).size === pool.length &&
    pool.every((role) => available.includes(role))
  );
}

/** Checks rules and available seats only; never scores or selects a wolf count. */
export function hasFeasibleAutomaticWerewolfLineup(
  players: number,
  roles: readonly WerewolfSpecialRole[],
  settings: Partial<WerewolfSettings> = {},
): boolean {
  const normalized = automaticWerewolfSettings(settings);
  if (!normalized || !validAutomaticRolePool(players, roles)) return false;
  if (
    (normalized.amulet && players < 10) ||
    (normalized.drunk && players < 9) ||
    (roles.includes("mayor") && normalized.mayor === "hammer" && players < 10)
  )
    return false;
  return availableWerewolfCounts(players).some((wolves) =>
    validWerewolfRoles(players, roles, wolves),
  );
}

export function drawAutomaticWerewolfLineup(
  players: number,
  pool: readonly WerewolfSpecialRole[],
  roleCount: number,
  random: () => number,
  settings: Partial<WerewolfSettings> = {},
): AutomaticWerewolfLineup | null {
  if (
    !validAutomaticRolePool(players, pool) ||
    !Number.isInteger(roleCount) ||
    roleCount < 0 ||
    roleCount > pool.length
  )
    return null;
  const ordered = [...pool].sort();
  const choices: WerewolfSpecialRole[][] = [];
  for (let mask = 0; mask < 2 ** ordered.length; mask++) {
    const roles = ordered.filter((_, i) => Boolean(mask & (1 << i)));
    if (roles.length !== roleCount) continue;
    if (hasFeasibleAutomaticWerewolfLineup(players, roles, settings)) choices.push(roles);
  }
  if (!choices.length) return null;
  const draw = random();
  if (!Number.isFinite(draw) || draw < 0 || draw >= 1) return null;
  return resolveAutomaticWerewolfLineup(
    players,
    choices[Math.floor(draw * choices.length)]!,
    settings,
  );
}
