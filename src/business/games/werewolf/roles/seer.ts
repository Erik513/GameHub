import { pick, spec } from "./step";
import { ability } from "./cardAbility";
import { defineRole } from "./define";

export const seer = defineRole({
  id: "seer",
  steps: {
    seer: () => spec("seerChoose", "choose", { pick: pick("inspect") }),
    vision: (state) =>
      spec("seerResult", "result", {
        confirm: "closeVision",
        result: { ability: "inspect", found: state.isWolf, name: state.target },
      }),
  },
  cardEffects: {
    inspected: ({ person }) => person.inspected,
  },
  cardAbilities: (state) => {
    // After the result was shown the narrator can still look at another person (a wrong person was chosen).
    return [
      ability(
        "inspect",
        "inspected",
        state.status === "seer" || state.status === "vision" ? undefined : "blocked",
      ),
    ];
  },
  abilities: () => [{ ability: "inspect", symbol: "inspected" }],
});
