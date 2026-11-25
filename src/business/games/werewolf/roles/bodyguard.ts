import { pick, spec } from "./step";
import { defineRole } from "./define";

export const bodyguard = defineRole({
  id: "bodyguard",
  steps: {
    bodyguard: () => spec("bodyguardProtect", "choose", { pick: pick("protect") }),
  },
  cardEffects: {
    // Blue while nobody attacks him; dark green once the wolves attacked him and the protection saved him.
    // Only the choice of this night (the game keeps the last one for its rule).
    protected: ({ state, person, night }) =>
      night &&
      state.protectedNight === state.night &&
      state.protectedPlayer === person.name &&
      state.wolfTarget?.name !== person.name,
    protectedSaved: ({ state, person, night }) =>
      night &&
      state.protectedNight === state.night &&
      state.protectedPlayer === person.name &&
      state.wolfTarget?.name === person.name,
  },
  abilityList: [{ ability: "protect", symbol: "protected" }],
  // In the configuration: the minimum number of players, the place on the screens, the options.
  setup: { family: "bodyguard", minPlayers: 6, order: 4 },
  // At night: the step the role wakes in and its place in the night.
  night: { step: "guard", place: 3 },
});
