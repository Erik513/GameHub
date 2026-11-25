import { defineRole } from "./define";

export const nightGuest = defineRole({
  id: "nightGuest",
  abilities: () => [{ ability: "stayWith", symbol: "guest" }],
});
