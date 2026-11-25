/**
 * All roles of the game, as the narrator view names them: the three basic roles (wolf, seer, villager), the special
 * roles and the drunk (an extra who does not know his role yet). A new role needs its place here and a file in this
 * folder; the types of the roles are derived from this list, and the compiler reports every missing part.
 */
export const roleIds = [
  "wolf",
  "seer",
  "apprenticeSeer",
  "villager",
  "witch",
  "hunter",
  "idiot",
  "bodyguard",
  "nightGuest",
  "cupid",
  "toughGuy",
  "tanner",
  "spellcaster",
  "mayor",
  "paranormalInvestigator",
  "magician",
  "drunk",
] as const;

/** A role of the narrator view (the real roles and the drunk). */
export type RoleId = (typeof roleIds)[number];

/** The roles every game has, and the extra that is no role of its own. */
export type BasicRoleId = "wolf" | "seer" | "villager";

/** The special roles: the configuration chooses them. */
export type SpecialRoleId = Exclude<RoleId, BasicRoleId | "drunk">;

/** The roles a person can have in the game (the drunk is an extra on top of a role). */
export type GameRoleId = Exclude<RoleId, "drunk">;

/** The roles that never wake up at night: their card has no step of its own. */
export type PassiveRoleId = "villager" | "idiot" | "toughGuy" | "tanner";

/** The special roles (every role except the three basic roles and the drunk), in the order of the list of roles. */
export const specialRoleIds: readonly SpecialRoleId[] = roleIds.filter(
  (role): role is SpecialRoleId =>
    role !== "wolf" && role !== "seer" && role !== "villager" && role !== "drunk",
);
