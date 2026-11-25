import { spec } from "./step";
import { defineRole } from "./define";

export const cupid = defineRole({
  id: "cupid",
  steps: {
    cupid: () => spec("cupidBond", "choose", { compound: "bond" }),
    lovers: () => spec("loversInfo", "info", { confirm: "loversReady" }),
  },
  abilityList: [{ ability: "bond", consumable: true, symbol: "lovers" }],
  // In the configuration: the minimum number of players, the place on the screens, the options.
  setup: { minPlayers: 7, order: 6 },
  // At night: the step the role wakes in and its place in the night.
  night: { step: "cupid", place: 1, timing: "firstNight" },
});
