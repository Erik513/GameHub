import type { WerewolfSettings } from "./configuration";
import { roleDefinition } from "./roles";

/**
 * The way a role is played in this game, named like the options of the configuration: the tough guy (wolf attack only or
 * every attack), the hunter (duty to shoot or not), the tanner (win on any exit or by the vote only), the mayor (double
 * vote or hammer) and the spellcaster (may or may not pick himself).
 */
export type RoleVariantId =
  | "wolfOnly"
  | "anyAttack"
  | "optional"
  | "required"
  | "anyDeath"
  | "voteOnly"
  | "doubleVote"
  | "hammer"
  | "allowed"
  | "forbidden";

type VariantSettings = Pick<
  WerewolfSettings,
  "allowSelfSilence" | "hunterShot" | "mayor" | "tanner" | "toughGuy"
>;

/** The variant of a role in this game, or null for a role that has no options (it comes from the definition of the role). */
export function roleVariantOf(role: string, settings: VariantSettings): RoleVariantId | null {
  return roleDefinition(role)?.variant(settings) ?? null;
}
