import { spec } from "./step";
import { ability, consumable } from "./cardAbility";
import { defineRole } from "./define";

export const witch = defineRole({
  id: "witch",
  steps: {
    witch: (_, usable) =>
      spec(usable ? "witchPotions" : "witchEmpty", usable ? "choose" : "info", {
        showsVictim: true,
        skippable: true,
        compound: "potions",
      }),
  },
  cardEffects: {
    healed: ({ state, person }) => state.healedPlayer === person.name,
    poisoned: ({ state, person, night }) =>
      night && "poisoned" in state && state.poisoned?.name === person.name,
  },
  cardAbilities: (state) => {
    return [
      consumable(
        ability(
          "heal",
          "healPotion",
          !state.potions.heal ? "used" : state.wolfTarget ? undefined : "blocked",
        ),
      ),
      consumable(ability("poison", "poisoned", state.potions.poison ? undefined : "used")),
    ];
  },
  abilities: () => [
    { ability: "heal", symbol: "healPotion" },
    { ability: "poison", symbol: "poisoned" },
  ],
});
