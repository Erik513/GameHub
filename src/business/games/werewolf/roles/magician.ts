import { defineRole } from "./define";

export const magician = defineRole({
  id: "magician",
  abilities: () => [
    { ability: "heal", symbol: "heal" },
    { ability: "kill", symbol: "kill" },
  ],
});
