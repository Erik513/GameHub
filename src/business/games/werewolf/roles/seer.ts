import { defineRole } from "./define";

export const seer = defineRole({
  id: "seer",
  abilities: () => [{ ability: "inspect", symbol: "inspected" }],
});
