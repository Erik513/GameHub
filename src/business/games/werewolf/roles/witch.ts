import { spec } from "./step";
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
  abilityList: [
    { ability: "heal", consumable: true, symbol: "healPotion" },
    { ability: "poison", consumable: true, symbol: "poisoned" },
  ],
  availability: (state) => ({
    heal: { why: !state.potions.heal ? "used" : state.wolfTarget ? undefined : "blocked" },
    poison: { why: state.potions.poison ? undefined : "used" },
  }),
});
