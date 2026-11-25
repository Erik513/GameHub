import { defineRole } from "./define";

export const hunter = defineRole({
  id: "hunter",
  abilities: () => [{ ability: "shot", symbol: "shotDuty" }],
  variant: (settings) => settings.hunterShot,
});
