import { pick, spec } from "./step";
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
      state.wolfChoice !== person.name,
    // The wolves chose the host: the night guest took the attack for him (or the amulet stopped it).
    guestSaved: ({ state, person, night }) =>
      night &&
      state.hostNight === state.night &&
      state.hostPlayer === person.name &&
      state.wolfChoice === person.name,
  },
  abilityList: [{ ability: "stayWith", symbol: "guest" }],
  // In the configuration: the minimum number of players, the place on the screens, the options.
  setup: { family: "bodyguard", minPlayers: 6, order: 5 },
  // At night: the step the role wakes in and its place in the night.
  night: { step: "guard", place: 3 },
});
