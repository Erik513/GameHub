import type { WerewolfSettings } from "../../business/games/werewolf/configuration";
import {
  roleDefinitions,
  type RoleAbility as RoleDefinitionAbility,
  type RoleId,
} from "../../business/games/werewolf/roles";
import type { ConfigInfoId } from "./ConfigInfo";

/** What a role can do, as symbols; `ability` names the matching short text, or the symbol's own name when null. */
export type RoleAbility = RoleDefinitionAbility;

/** The roles of the game as the narrator view names them (the real roles plus the drunk, who knows nothing yet). */
export type DealtRole = RoleId;

/**
 * The abilities of a role in the order the player uses them. Passive roles (the villager, the idiot, the tough guy,
 * the tanner, the apprentice seer, the drunk) have none; the card then says so. They come from the definition of the role.
 */
export function abilitiesOfRole(
  role: DealtRole,
  mayor: "doubleVote" | "hammer",
): readonly RoleAbility[] {
  return roleDefinitions[role].abilities({ mayor });
}

/** The explanation that belongs to a dealt role. */
export function infoOfRole(role: DealtRole): ConfigInfoId {
  switch (role) {
    case "wolf":
      return "wolves";
    case "villager":
      return "villagers";
    case "bodyguard":
    case "nightGuest":
      return "guard";
    default:
      return role;
  }
}

/** The way a role is played in this game, named like the options of the configuration. */
export type RoleVariant =
  | "allowed"
  | "anyAttack"
  | "anyDeath"
  | "forbidden"
  | "optional"
  | "required"
  | "voteOnly"
  | "wolfOnly";

/**
 * The option of a role that the game was set up with (the hunter with or without the duty to shoot, ...), or null for
 * a role that has no options. It stands on the card of the role, so the player knows how the role works here. The mayor
 * has none here: his ability (the hammer or the 2) already shows how he plays.
 */
export function variantOfRole(
  role: DealtRole,
  settings: Pick<WerewolfSettings, "allowSelfSilence" | "hunterShot" | "tanner" | "toughGuy">,
): RoleVariant | null {
  const variant = roleDefinitions[role].variant({ ...settings, mayor: "doubleVote" });
  return variant === "doubleVote" || variant === "hammer" ? null : variant;
}
