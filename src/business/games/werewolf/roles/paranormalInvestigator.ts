import { pick, spec } from "./step";
import { defineRole } from "./define";

export const paranormalInvestigator = defineRole({
  id: "paranormalInvestigator",
  steps: {
    investigator: (_, usable) =>
      spec(usable ? "investigatorChoose" : "investigatorUsed", "choose", {
        skippable: true,
        pick: pick("investigate"),
      }),
    investigation: (state) =>
      spec("investigatorResult", "result", {
        confirm: "closeInvestigation",
        result: { ability: "investigate", found: state.isWolfNearby, name: state.target },
      }),
  },
  cardEffects: {
    investigated: ({ person }) => person.investigated,
  },
  abilityList: [{ ability: "investigate", consumable: true, symbol: "investigation" }],
  availability: (state) => ({
    investigate: { why: state.investigationUsed ? "used" : undefined },
  }),
  // In the configuration: the minimum number of players, the place on the screens, the options.
  setup: { minPlayers: 10, order: 12 },
  // At night: the step the role wakes in and its place in the night.
  night: { step: "paranormalInvestigator", place: 6 },
});
