import { seer } from "./seer";
import { defineRole } from "./define";

export const apprenticeSeer = defineRole({
  id: "apprenticeSeer",
  cardAbilities: seer.cardAbilities,
  abilities: () => [],
  // In the configuration: the minimum number of players, the place on the screens, the options.
  setup: { minPlayers: 8, order: 9 },
  // At night: the step the role wakes in and its place in the night.
  night: { step: "seer", place: 5 },
});
