import type { CardAbility, CardAbilitySymbol, CardAbilityId } from "../narratorCard";

/** One ability; `why` says why it cannot be used (undefined: it can). */
export function ability(
  id: CardAbilityId,
  symbol: CardAbilitySymbol,
  why?: "blocked" | "used",
  count?: number,
): CardAbility {
  return {
    available: why === undefined,
    id,
    symbol,
    ...(why === undefined ? {} : { unavailable: why }),
    ...(count === undefined ? {} : { count }),
  };
}

/** Marks an ability that is used up by using it. */
export function consumable(entry: CardAbility): CardAbility {
  return { ...entry, consumable: true };
}
