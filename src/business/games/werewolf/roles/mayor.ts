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
  // In the configuration: the minimum number of players, the place on the screens, the options.
  setup: {
    minPlayers: 9,
    order: 11,
    options: {
      key: "mayor",
      values: [
        { id: "doubleVote", value: "doubleVote" },
        { id: "hammer", value: "hammer" },
      ],
    },
  },
  // At night: the step the role wakes in and its place in the night.
  night: {
    step: "mayor",
    place: 9,
    timing: "fromSecondNight",
    wakes: (settings) => settings.mayor === "hammer",
  },
});
