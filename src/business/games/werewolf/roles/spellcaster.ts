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
});
