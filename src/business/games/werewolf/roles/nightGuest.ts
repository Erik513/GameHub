import { pick, spec } from "./step";
import { ability } from "./cardAbility";
import { defineRole } from "./define";

export const nightGuest = defineRole({
  id: "nightGuest",
  steps: {
    nightGuest: () => spec("nightGuestStay", "choose", { pick: pick("stayWith") }),
  },
  cardEffects: {
    // Blue while nobody attacks the host; dark green once the wolves attacked him and the night guest saved him.
    // Only the choice of this night (the game keeps the last one for its rule).
    guest: ({ state, person, night }) =>
      night &&
      state.hostNight === state.night &&
      state.hostPlayer === person.name &&
      state.wolfTarget?.name !== person.name,
    guestSaved: ({ state, person, night }) =>
      night &&
      state.hostNight === state.night &&
      state.hostPlayer === person.name &&
      state.wolfTarget?.name === person.name,
  },
  cardAbilities: () => {
    return [ability("stayWith", "guest")];
  },
  abilities: () => [{ ability: "stayWith", symbol: "guest" }],
});
