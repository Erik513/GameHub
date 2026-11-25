import { defineRole } from "./define";

export const bodyguard = defineRole({
  id: "bodyguard",
  abilities: () => [{ ability: "protect", symbol: "protected" }],
});
