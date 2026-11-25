import { pick, spec } from "./step";
import { ability } from "./cardAbility";
import { defineRole } from "./define";

export const bodyguard = defineRole({
  id: "bodyguard",
  steps: {
    bodyguard: () => spec("bodyguardProtect", "choose", { pick: pick("protect") }),
  },
  cardEffects: {
    protected: ({ state, person, night }) => night && state.protectedPlayer === person.name,
  },
  cardAbilities: () => {
    return [ability("protect", "protected")];
  },
  abilities: () => [{ ability: "protect", symbol: "protected" }],
});
