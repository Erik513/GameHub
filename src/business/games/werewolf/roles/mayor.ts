import { pick, spec } from "./step";
import { ability, consumable } from "./cardAbility";
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
  cardAbilities: (state) => {
    return [
      consumable(
        ability(
          "hammer",
          "hammer",
          state.hammerUsed
            ? "used"
            : state.settings.mayor === "hammer" && state.night >= 2
              ? undefined
              : "blocked",
        ),
      ),
    ];
  },
  abilities: ({ mayor }) =>
    mayor === "hammer"
      ? [{ ability: "hammer", symbol: "hammer" }]
      : [{ ability: null, symbol: "doubleVote" }],
  variant: (settings) => settings.mayor,
});
