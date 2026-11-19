export const werewolfPlayerLimits = {
  minimum: 6,
  supportedMaximum: 20,
  targetMaximum: 20,
} as const;

export const werewolfRoleMinimums = {
  bodyguard: 6,
  nightGuest: 6,
  witch: 6,
  hunter: 6,
  cupid: 7,
  idiot: 6,
  spellcaster: 9,
  mayor: 9,
  toughGuy: 7,
  apprenticeSeer: 8,
  paranormalInvestigator: 10,
  magician: 11,
  tanner: 8,
} as const;

export type WerewolfSpecialRole = keyof typeof werewolfRoleMinimums;

export interface WerewolfSettings {
  readonly wolfCountMode?: "standard" | "balanced";
  readonly mayor: "doubleVote" | "hammer";
  readonly hunterShot: "optional" | "required";
  readonly allowSelfSilence: boolean;
  readonly revealRoles: boolean;
  readonly drunk: boolean;
  readonly tanner: "anyDeath" | "voteOnly";
  readonly amulet: boolean;
  readonly attackOnFirstNight: boolean;
  readonly wolfCount: number;
}

export function standardWerewolfCount(players: number): number {
  return players < 8
    ? 1
    : players < 12
      ? 2
      : players === 16 || players === 17 || players === 18 || players === 19 || players === 20
        ? 4
        : 3;
}

export function availableWerewolfCounts(players: number): readonly number[] {
  if (
    !Number.isInteger(players) ||
    players < werewolfPlayerLimits.minimum ||
    players > werewolfPlayerLimits.supportedMaximum
  )
    return [];
  if (players === 7 || players === 8) return [1, 2];
  if (players === 11) return [2, 3];
  if (players === 12) return [2, 3];
  if (players === 14) return [3, 4];
  if (players === 15) return [3, 4];
  if (players === 16) return [3, 4];
  if (players === 17) return [3, 4, 5];
  if (players === 18) return [3, 4, 5];
  if (players === 19) return [3, 4, 5];
  if (players === 20) return [3, 4, 5];
  return [standardWerewolfCount(players)];
}

/** A starting wolf majority or parity would end the match before the first turn. */
export function calculatedWerewolfCounts(players: number): readonly number[] {
  if (
    players === 7 ||
    players === 8 ||
    players === 11 ||
    players === 18 ||
    players === 19 ||
    players === 20
  )
    return availableWerewolfCounts(players);
  if (
    !Number.isInteger(players) ||
    players < werewolfPlayerLimits.minimum ||
    players > werewolfPlayerLimits.supportedMaximum
  )
    return [];
  return Array.from(
    { length: Math.min(players === 17 ? 8 : 4, Math.floor((players - 1) / 2)) },
    (_, index) => index + 1,
  );
}

export function validWerewolfRoles(
  players: number,
  roles: readonly WerewolfSpecialRole[],
  wolves: number,
  mode: "standard" | "balanced" = "standard",
): boolean {
  return (
    Number.isInteger(players) &&
    players >= werewolfPlayerLimits.minimum &&
    players <= werewolfPlayerLimits.supportedMaximum &&
    (mode === "balanced"
      ? calculatedWerewolfCounts(players)
      : availableWerewolfCounts(players)
    ).includes(wolves) &&
    roles.length + wolves + 1 <= players &&
    new Set(roles).size === roles.length &&
    roles.every((role) => Object.hasOwn(werewolfRoleMinimums, role)) &&
    !(roles.includes("bodyguard") && roles.includes("nightGuest")) &&
    (!(roles.includes("witch") && roles.includes("magician")) ||
      (players === 14 && wolves === 4) ||
      (players === 15 && wolves === 4) ||
      (players === 16 && wolves === 4) ||
      (players === 17 && (wolves === 4 || wolves === 5)) ||
      (players === 18 && (wolves === 4 || wolves === 5)) ||
      (players === 19 && (wolves === 4 || wolves === 5)) ||
      (players === 20 && (wolves === 4 || wolves === 5))) &&
    (!roles.includes("magician") || players >= 11)
  );
}

export function availableWerewolfRoles(players: number): WerewolfSpecialRole[] {
  return (Object.keys(werewolfRoleMinimums) as WerewolfSpecialRole[]).filter(
    (role) => players >= werewolfRoleMinimums[role],
  );
}
