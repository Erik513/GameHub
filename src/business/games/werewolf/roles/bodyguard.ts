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
});
