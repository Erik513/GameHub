import { defineRole } from "./define";

export const mayor = defineRole({
  id: "mayor",
  abilities: ({ mayor }) =>
    mayor === "hammer"
      ? [{ ability: "hammer", symbol: "hammer" }]
      : [{ ability: null, symbol: "doubleVote" }],
  variant: (settings) => settings.mayor,
});
