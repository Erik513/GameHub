import { pick, spec } from "./step";
import { defineRole } from "./define";

export const mayor = defineRole({
  id: "mayor",
  steps: {
    mayor: (_, usable) =>
      spec(usable ? "mayorHammer" : "mayorUnavailable", "choose", {
        skippable: true,
        pick: pick("hammer"),
      }),
  },
  cardEffects: {
    hammered: ({ state, person }) => state.hammerVictim === person.name,
    twoVotes: ({ person }) => person.twoVotes,
  },
  abilityList: [{ ability: "hammer", consumable: true, symbol: "hammer" }],
  availability: (state) => ({
    hammer: {
      why: state.hammerUsed
        ? "used"
        : state.settings.mayor === "hammer" && state.night >= 2
          ? undefined
          : "blocked",
    },
  }),
  // At the deal the mayor of a game with the double vote shows the 2 (no button) instead of the hammer.
  abilities: ({ mayor }) =>
    mayor === "hammer"
      ? [{ ability: "hammer", symbol: "hammer" }]
      : [{ ability: null, symbol: "doubleVote" }],
  variant: (settings) => settings.mayor,
});
