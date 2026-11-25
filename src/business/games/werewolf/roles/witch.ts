import { defineRole } from "./define";

export const witch = defineRole({
  id: "witch",
  abilities: () => [
    { ability: "heal", symbol: "healPotion" },
    { ability: "poison", symbol: "poisoned" },
  ],
});
