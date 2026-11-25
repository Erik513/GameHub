import { spec } from "./step";
import { defineRole } from "./define";

export const cupid = defineRole({
  id: "cupid",
  steps: {
    cupid: () => spec("cupidBond", "choose", { compound: "bond" }),
    lovers: () => spec("loversInfo", "info", { confirm: "loversReady" }),
  },
  abilityList: [{ ability: "bond", consumable: true, symbol: "lovers" }],
});
