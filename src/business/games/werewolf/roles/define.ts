import { ability, consumable } from "./cardAbility";
import type { AbilityAvailability, AbilitySpec, RoleDefinition } from "./types";

/** The parts of a role as its file writes them: one list of its abilities and, when it changes, their availability. */
type RoleParts = Pick<RoleDefinition, "id"> &
  Partial<Omit<RoleDefinition, "id">> & {
    /** The abilities in the order the player uses them, with their symbols (one list for the card and the deal). */
    readonly abilityList?: readonly AbilitySpec[];
    /** Why an ability cannot be used now and what is left of it; an ability that is not named can be used. */
    readonly availability?: AbilityAvailability;
  };

/**
 * A role from its parts. The buttons of the card (with what can be used now) and the abilities of the deal both come
 * from the one list of abilities; a role without abilities or options gets none.
 */
export function defineRole({
  abilityList = [],
  availability,
  ...definition
}: RoleParts): RoleDefinition {
  return {
    cardAbilities: (state) => {
      const now = availability?.(state) ?? {};
      return abilityList.map((entry) => {
        const button = ability(
          entry.ability,
          entry.symbol,
          now[entry.ability]?.why,
          now[entry.ability]?.count,
        );
        return entry.consumable ? consumable(button) : button;
      });
    },
    abilities: () => abilityList.map(({ ability: id, symbol }) => ({ ability: id, symbol })),
    variant: () => null,
    ...definition,
  };
}
