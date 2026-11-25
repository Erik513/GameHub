import type { WerewolfSettings } from "../../business/games/werewolf/configuration";
import type { CardAbilityId } from "../../business/games/werewolf/narratorCard";
import type { ConfigInfoId } from "./ConfigInfo";
import type { SymbolId } from "./symbols/catalog";

/** What a role can do, as symbols; `ability` names the matching short text, or the symbol's own name when null. */
export interface RoleAbility {
  readonly symbol: SymbolId;
  readonly ability: CardAbilityId | null;
}

/** The roles of the game as the narrator view names them (the real roles plus the drunk, who knows nothing yet). */
export type DealtRole = SymbolId &
  (
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
    | "drunk"
  );

/**
 * The abilities of a role in the order the player uses them. Passive roles (the villager, the idiot, the tough guy,
 * the tanner, the apprentice seer, the drunk) have none; the card then says so.
 */
export function abilitiesOfRole(
  role: DealtRole,
  mayor: "doubleVote" | "hammer",
): readonly RoleAbility[] {
  switch (role) {
    case "wolf":
      return [{ ability: "attack", symbol: "attacked" }];
    case "seer":
      return [{ ability: "inspect", symbol: "inspected" }];
    case "witch":
      return [
        { ability: "heal", symbol: "healPotion" },
        { ability: "poison", symbol: "poisoned" },
      ];
    case "magician":
      return [
        { ability: "heal", symbol: "heal" },
        { ability: "kill", symbol: "kill" },
      ];
    case "hunter":
      return [{ ability: "shot", symbol: "shotDuty" }];
    case "bodyguard":
      return [{ ability: "protect", symbol: "protected" }];
    case "nightGuest":
      return [{ ability: "stayWith", symbol: "guest" }];
    case "cupid":
      return [{ ability: "bond", symbol: "lovers" }];
    case "spellcaster":
      return [{ ability: "silence", symbol: "silenced" }];
    case "paranormalInvestigator":
      return [{ ability: "investigate", symbol: "investigation" }];
    case "mayor":
      return mayor === "hammer"
        ? [{ ability: "hammer", symbol: "hammer" }]
        : [{ ability: null, symbol: "doubleVote" }];
    default:
      return [];
  }
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
 * a role that has no options. It stands on the card of the role, so the player knows how the role works here.
 */
export function variantOfRole(
  role: DealtRole,
  settings: Pick<WerewolfSettings, "allowSelfSilence" | "hunterShot" | "tanner" | "toughGuy">,
): RoleVariant | null {
  switch (role) {
    case "hunter":
      return settings.hunterShot;
    case "toughGuy":
      return settings.toughGuy;
    case "tanner":
      return settings.tanner;
    case "spellcaster":
      return settings.allowSelfSilence ? "allowed" : "forbidden";
    default:
      return null;
  }
}
