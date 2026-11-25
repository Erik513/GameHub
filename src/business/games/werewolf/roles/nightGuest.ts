import { pick, spec } from "./step";
import { ability } from "./cardAbility";
import { defineRole } from "./define";

export const nightGuest = defineRole({
  id: "nightGuest",
  steps: {
    nightGuest: () => spec("nightGuestStay", "choose", { pick: pick("stayWith") }),
  },
  cardEffects: {
    guest: ({ state, person, night }) => night && state.hostPlayer === person.name,
  },
  cardAbilities: () => {
    return [ability("stayWith", "guest")];
  },
  abilities: () => [{ ability: "stayWith", symbol: "guest" }],
});
