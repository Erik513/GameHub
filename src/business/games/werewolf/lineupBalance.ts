import calibration from "./balanceCalibration.json";
import {
  availableWerewolfCounts,
  calculatedWerewolfCounts,
  availableWerewolfRoles,
  standardWerewolfCount,
  validWerewolfRoles,
  type WerewolfSettings,
  type WerewolfSpecialRole,
} from "./configuration";

export interface WerewolfPointContribution {
  readonly id: string;
  readonly points: number;
}

export interface WerewolfBalance {
  readonly version: number;
  readonly evidence: "calibrated" | "baselineOnly" | "provisional";
  readonly villagePoints: number;
  readonly contributions: readonly WerewolfPointContribution[];
  readonly standardWolfCount: number;
  readonly recommendedWolfCount: number;
  readonly candidates: readonly {
    readonly wolfCount: number;
    readonly villageTarget: number;
    readonly difference: number;
  }[];
}

/** Scores role effects in addition to the mandatory seer. Positive points favor the village. */
export function scoreWerewolfVillage(
  roles: readonly WerewolfSpecialRole[],
  settings: Partial<WerewolfSettings> = {},
): readonly WerewolfPointContribution[] {
  const contributions: WerewolfPointContribution[] = [
    { id: "seer", points: calibration.seerPoints },
  ];
  for (const role of roles) {
    const adjustment =
      role === "mayor" && settings.mayor === "hammer" ? calibration.modifierPoints.hammer : 0;
    contributions.push({ id: role, points: calibration.rolePoints[role] + adjustment });
  }
  const modifiers = {
    selfSilence: roles.includes("spellcaster") && settings.allowSelfSilence,
    drunk: settings.drunk,
    amulet: settings.amulet,
    earlyAttack: settings.attackOnFirstNight,
  };
  for (const [id, active] of Object.entries(modifiers)) {
    if (active)
      contributions.push({ id, points: calibration.modifierPoints[id as keyof typeof modifiers] });
  }
  for (const [id, points] of Object.entries(calibration.combinationPoints)) {
    if (
      points &&
      id.split("+").every((role) => role === "seer" || roles.includes(role as WerewolfSpecialRole))
    ) {
      contributions.push({ id, points });
    }
  }
  return contributions;
}

export function evaluateWerewolfLineup(
  players: number,
  roles: readonly WerewolfSpecialRole[],
  settings: Partial<WerewolfSettings> = {},
): WerewolfBalance | null {
  const available = availableWerewolfRoles(players);
  if (
    !roles.every((role) => available.includes(role)) ||
    (settings.amulet && players < 10) ||
    (settings.drunk && players < 9) ||
    (roles.includes("mayor") && settings.mayor === "hammer" && players < 10)
  )
    return null;
  const counts =
    settings.wolfCount === undefined ? calculatedWerewolfCounts(players) : [settings.wolfCount];
  const contributions = scoreWerewolfVillage(roles, settings);
  const villagePoints = contributions.reduce((sum, entry) => sum + entry.points, 0);
  const standardWolfCount = standardWerewolfCount(players);
  const target =
    calibration.playerTargets[String(players) as keyof typeof calibration.playerTargets];
  const candidates = counts
    .filter(
      (wolves) =>
        validWerewolfRoles(players, roles, wolves, "balanced") && (!settings.drunk || wolves >= 2),
    )
    .map((wolfCount) => ({
      wolfCount,
      villageTarget: target + calibration.wolfPoints * wolfCount,
      difference: villagePoints - target - calibration.wolfPoints * wolfCount,
    }))
    .sort(
      (left, right) =>
        Math.abs(left.difference) - Math.abs(right.difference) ||
        Math.abs(left.wolfCount - standardWolfCount) -
          Math.abs(right.wolfCount - standardWolfCount),
    );
  const best = candidates[0];
  if (!best) return null;
  return {
    version: calibration.version,
    evidence:
      players >= 15 ||
      (roles.includes("hunter") && settings.hunterShot === "required") ||
      settings.revealRoles === false ||
      !availableWerewolfCounts(players).includes(best.wolfCount)
        ? "provisional"
        : players < 9
          ? "baselineOnly"
          : "calibrated",
    villagePoints,
    contributions,
    standardWolfCount,
    recommendedWolfCount: best.wolfCount,
    candidates,
  };
}

export interface RandomWerewolfLineup {
  readonly roles: readonly WerewolfSpecialRole[];
  readonly balance: WerewolfBalance;
}

/** Every feasible subset has equal probability, including pools containing alternative roles. */
export function drawWerewolfLineup(
  players: number,
  pool: readonly WerewolfSpecialRole[],
  roleCount: number,
  random: () => number,
  settings: Partial<WerewolfSettings> = {},
): RandomWerewolfLineup | null {
  const available = availableWerewolfRoles(players);
  if (
    !Number.isInteger(roleCount) ||
    roleCount < 0 ||
    roleCount > pool.length ||
    pool.length > 13 ||
    new Set(pool).size !== pool.length ||
    !pool.every((role) => available.includes(role))
  )
    return null;
  const choices: RandomWerewolfLineup[] = [];
  for (let mask = 0; mask < 2 ** pool.length; mask++) {
    const roles = pool.filter((_, index) => (mask & (1 << index)) !== 0);
    if (roles.length !== roleCount) continue;
    const balance = evaluateWerewolfLineup(players, roles, settings);
    if (balance) choices.push({ roles, balance });
  }
  if (!choices.length) return null;
  const draw = random();
  if (!Number.isFinite(draw) || draw < 0 || draw >= 1) return null;
  return choices[Math.floor(draw * choices.length)] ?? null;
}
