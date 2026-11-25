import { defineRole } from "./define";

export const toughGuy = defineRole({
  id: "toughGuy",
  variant: (settings) => settings.toughGuy,
});
