import { spec } from "./step";
import { ability, consumable } from "./cardAbility";
import { defineRole } from "./define";

export const magician = defineRole({
  id: "magician",
  steps: {
    magician: (_, usable) =>
      spec(usable ? "magicianSpells" : "magicianEmpty", usable ? "choose" : "info", {
        showsVictim: true,
        skippable: true,
        compound: "castSpells",
      }),
  },
  cardEffects: {
    spellHealed: ({ state, person }) => state.spellHealedPlayer === person.name,
    spellKilled: ({ state, person }) =>
      state.spellVictims.some((victim) => victim.name === person.name),
  },
  cardAbilities: (state) => {
    const left = state.spellsRemaining;
    return [
      consumable(
        ability(
          "heal",
          "heal",
          left <= 0 ? "used" : state.wolfTarget ? undefined : "blocked",
          left,
        ),
      ),
      consumable(ability("kill", "kill", left <= 0 ? "used" : undefined, left)),
    ];
  },
  abilities: () => [
    { ability: "heal", symbol: "heal" },
    { ability: "kill", symbol: "kill" },
  ],
});
