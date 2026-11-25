import { spec } from "./step";
import { defineRole } from "./define";
import type { WerewolfState } from "../stateMachine";

/** The steps after the witch in the same night, in which her poison is decided but not announced yet. */
const stepsAfterWitch: readonly WerewolfState["status"][] = [
  "magician",
  "mayor",
  "spellcaster",
  "amuletPass",
  "morning",
];

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
    // Only after the witch in the same night: the game object keeps the field of the last night until it is replaced.
    poisoned: ({ state, person, night }) =>
      night &&
      stepsAfterWitch.includes(state.status) &&
      "poisoned" in state &&
      state.poisoned?.name === person.name,
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
