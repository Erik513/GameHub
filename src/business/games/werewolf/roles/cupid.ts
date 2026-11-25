import { spec } from "./step";
import { ability, consumable } from "./cardAbility";
import { defineRole } from "./define";

export const cupid = defineRole({
  id: "cupid",
  steps: {
    cupid: () => spec("cupidBond", "choose", { compound: "bond" }),
    lovers: () => spec("loversInfo", "info", { confirm: "loversReady" }),
  },
  cardAbilities: () => {
    return [consumable(ability("bond", "lovers"))];
  },
  abilities: () => [{ ability: "bond", symbol: "lovers" }],
});
