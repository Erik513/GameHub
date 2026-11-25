import { pick, spec } from "./step";
import { defineRole } from "./define";

export const wolf = defineRole({
  id: "wolf",
  steps: {
    wolves: (state) =>
      state.night === 1 && !state.settings.attackOnFirstNight
        ? spec("wolvesNoAttack", "info", { statement: "noAttack", confirm: "wolvesReady" })
        : spec("wolvesAttack", "choose", { pick: pick("attack") }),
  },
  cardEffects: {
    attacked: ({ state, person, night }) => night && state.wolfTarget?.name === person.name,
  },
  abilityList: [{ ability: "attack", symbol: "attacked" }],
  availability: (state) => ({
    attack: { why: state.night > 1 || state.settings.attackOnFirstNight ? undefined : "blocked" },
  }),
  // At night: the step the role wakes in and its place in the night.
  night: { step: "wolves", place: 4 },
});
