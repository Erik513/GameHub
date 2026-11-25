import { defineRole } from "./define";

export const idiot = defineRole({
  id: "idiot",
  // In the configuration: the minimum number of players, the place on the screens, the options.
  setup: { minPlayers: 6, order: 3 },
});
