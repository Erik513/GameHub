import type { CardAbility } from "../../business/games/werewolf/narratorCard";

/**
 * How the button of an ability looks: ready (green), used up for good (grey, struck through), not possible now because
 * of the situation (amber, dashed) or "dim" (it is not the turn of this ability).
 */
export type AbilityLook = "ready" | "used" | "blocked" | "dim";

/**
 * The look of an ability; `exhausted`: no spell left in this step, `dimmed`: not the turn of this ability, `spent`: it
 * was used in this step. An ability that is used up by using it (a potion, a spell) looks used up at once; one that is
 * there every night (the nomination, the attack) is only dimmed once it was used.
 */
export function abilityLookOf(
  ability: CardAbility,
  exhausted: boolean,
  dimmed: boolean,
  spent = false,
): AbilityLook {
  if (ability.unavailable === "used" || (spent && ability.consumable)) return "used";
  if (ability.unavailable === "blocked" || exhausted) return "blocked";
  if (dimmed) return "dim";
  return ability.available ? "ready" : "blocked";
}
