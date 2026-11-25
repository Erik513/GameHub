import type { RoleSteps } from "./step";
import type { describePlayers } from "../selectors";
import type { WerewolfState } from "../stateMachine";
import type { WerewolfSettings } from "../configuration";
import type { CardAbility, CardAbilityId, CardAbilitySymbol, CardEffect } from "../narratorCard";
import type { RoleVariantId } from "../roleVariant";

export type { RoleId } from "./roleIds";
import type { RoleId, SpecialRoleId } from "./roleIds";
import type { RoleNight } from "./night";

/** The symbol ids an ability can have (the double vote of the mayor is an ability that is no button). */
export type AbilitySymbol = CardAbilitySymbol | "doubleVote";

/** What a role can do, as symbols; `ability` names the matching short text, or the symbol's own name when null. */
export interface RoleAbility {
  readonly ability: CardAbilityId | null;
  readonly symbol: AbilitySymbol;
}

/** One ability of a role: its button and symbol, and whether using it uses it up. */
export interface AbilitySpec {
  readonly ability: CardAbilityId;
  readonly symbol: CardAbilitySymbol;
  readonly consumable?: true;
}

/** Why an ability cannot be used now ("blocked" or "used") and what is left of it, by ability. */
export type AbilityAvailability = (
  state: WerewolfState,
) => Partial<
  Record<CardAbilityId, { readonly why?: "blocked" | "used" | undefined; readonly count?: number }>
>;

/** The options of the game that change how a role is played. */
export type RoleSettings = Pick<
  WerewolfSettings,
  "allowSelfSilence" | "hunterShot" | "mayor" | "tanner" | "toughGuy"
>;

export interface CardEffectContext {
  readonly state: WerewolfState;
  readonly person: ReturnType<typeof describePlayers>[number];
  readonly night: boolean;
}

export type CardEffectRules = Partial<Record<CardEffect, (context: CardEffectContext) => boolean>>;

/** The settings an option of a role changes. */
export type RoleOptionKey = "allowSelfSilence" | "hunterShot" | "mayor" | "tanner" | "toughGuy";

/** How a special role is offered in the configuration. */
export interface RoleSetup {
  /** How many players a game needs at least for this role. */
  readonly minPlayers: number;
  /** The place of the role on the screens of the configuration (and in the rules). */
  readonly order: number;
  /** Two roles that are drawn as one (the bodyguard and the night guest): the first of them names the family. */
  readonly family?: SpecialRoleId;
  /** The options of the role: the setting they change and its values, each with the id of its entry. */
  readonly options?: {
    readonly key: RoleOptionKey;
    readonly values: readonly { readonly id: string; readonly value: boolean | string }[];
  };
}

/**
 * Everything that belongs to one role at one place (plain data and pure functions, no classes). The drawings stay in the
 * presentation: the definition only knows symbol ids. The transitions of the game stay in the state machine.
 */
export interface RoleDefinition {
  readonly id: RoleId;
  /** Special roles only: how the configuration offers the role. */
  readonly setup?: RoleSetup;
  /** The roles that wake up at night: their step and its place in the night. */
  readonly night?: RoleNight;
  readonly steps?: RoleSteps;
  readonly cardEffects?: CardEffectRules;
  readonly cardAbilities: (state: WerewolfState) => readonly CardAbility[];
  /** The abilities in the order the player uses them; passive roles have none. */
  readonly abilities: (settings: Pick<RoleSettings, "mayor">) => readonly RoleAbility[];
  /** The option of the game that the role is played with, or null for a role that has no options. */
  readonly variant: (settings: RoleSettings) => RoleVariantId | null;
}
