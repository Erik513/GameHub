import { defineRole } from "./define";

export const cupid = defineRole({
  id: "cupid",
  abilities: () => [{ ability: "bond", symbol: "lovers" }],
});
