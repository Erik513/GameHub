import type { CardAbility } from "../../business/games/werewolf/narratorCard";

/**
 * How the button of an ability looks: ready (green), used up for good (grey, struck through), not possible now because
 * of the situation (amber, dashed) or "dim" (it is not the turn of this ability).
 */
export type AbilityLook = "ready" | "used" | "blocked" | "dim";

/** The look of an ability; `exhausted`: no spell left in this step, `dimmed`: not the turn of this ability. */
export function abilityLookOf(
  ability: CardAbility,
  exhausted: boolean,
  dimmed: boolean,
): AbilityLook {
  if (ability.unavailable === "used") return "used";
  if (ability.unavailable === "blocked" || exhausted) return "blocked";
  if (dimmed) return "dim";
  return ability.available ? "ready" : "blocked";
}
