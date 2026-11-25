import { seer } from "./seer";
import { defineRole } from "./define";

export const apprenticeSeer = defineRole({
  id: "apprenticeSeer",
  cardAbilities: seer.cardAbilities,
});
