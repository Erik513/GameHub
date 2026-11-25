import { spec } from "./step";
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
  abilityList: [
    { ability: "heal", consumable: true, symbol: "heal" },
    { ability: "kill", consumable: true, symbol: "kill" },
  ],
  availability: (state) => {
    const left = state.spellsRemaining;
    return {
      heal: { count: left, why: left <= 0 ? "used" : state.wolfTarget ? undefined : "blocked" },
      kill: { count: left, why: left <= 0 ? "used" : undefined },
    };
  },
});
