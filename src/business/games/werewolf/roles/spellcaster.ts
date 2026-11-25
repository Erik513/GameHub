import { validTargets } from "../selectors";
import { pick, spec } from "./step";
import { defineRole } from "./define";

export const spellcaster = defineRole({
  id: "spellcaster",
  steps: {
    spellcaster: (state) =>
      spec("spellcasterSilence", "choose", {
        skippable: validTargets(state, "silence").length === 0,
        pick: pick("silence"),
      }),
  },
  cardEffects: {
    silenced: ({ person }) => Boolean(person.silenced),
  },
  abilityList: [{ ability: "silence", symbol: "silenced" }],
  variant: (settings) => (settings.allowSelfSilence ? "allowed" : "forbidden"),
  // In the configuration: the minimum number of players, the place on the screens, the options.
  setup: {
    minPlayers: 9,
    order: 10,
    options: {
      key: "allowSelfSilence",
      values: [
        { id: "allowed", value: true },
        { id: "forbidden", value: false },
      ],
    },
  },
  // At night: the step the role wakes in and its place in the night.
  night: { step: "spellcaster", place: 10 },
});
