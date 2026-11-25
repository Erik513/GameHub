import { defineRole } from "./define";

export const wolf = defineRole({
  id: "wolf",
  abilities: () => [{ ability: "attack", symbol: "attacked" }],
});
