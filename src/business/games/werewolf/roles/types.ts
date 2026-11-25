import type { WerewolfSettings } from "../configuration";
import type { CardAbilityId, CardAbilitySymbol } from "../narratorCard";
import type { RoleVariantId } from "../roleVariant";

/** The roles of the game as the narrator view names them (the real roles plus the drunk, who knows nothing yet). */
export type RoleId =
  | "wolf"
  | "seer"
  | "apprenticeSeer"
  | "villager"
  | "witch"
  | "hunter"
  | "idiot"
  | "bodyguard"
  | "nightGuest"
  | "cupid"
  | "toughGuy"
  | "tanner"
  | "spellcaster"
  | "mayor"
  | "paranormalInvestigator"
  | "magician"
  | "drunk";

/** The symbol ids an ability can have (the double vote of the mayor is an ability that is no button). */
export type AbilitySymbol = CardAbilitySymbol | "doubleVote";

/** What a role can do, as symbols; `ability` names the matching short text, or the symbol's own name when null. */
export interface RoleAbility {
  readonly ability: CardAbilityId | null;
  readonly symbol: AbilitySymbol;
}

/** The options of the game that change how a role is played. */
export type RoleSettings = Pick<
  WerewolfSettings,
  "allowSelfSilence" | "hunterShot" | "mayor" | "tanner" | "toughGuy"
>;

/**
 * Everything that belongs to one role at one place (plain data and pure functions, no classes). The drawings stay in the
 * presentation: the definition only knows symbol ids. The transitions of the game stay in the state machine.
 */
export interface RoleDefinition {
  readonly id: RoleId;
  /** The abilities in the order the player uses them; passive roles have none. */
  readonly abilities: (settings: Pick<RoleSettings, "mayor">) => readonly RoleAbility[];
  /** The option of the game that the role is played with, or null for a role that has no options. */
  readonly variant: (settings: RoleSettings) => RoleVariantId | null;
}
