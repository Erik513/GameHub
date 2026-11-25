import { pick, spec } from "./step";
import { ability } from "./cardAbility";
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
  cardAbilities: (state) => {
    return [
      ability(
        "attack",
        "attacked",
        state.night > 1 || state.settings.attackOnFirstNight ? undefined : "blocked",
      ),
    ];
  },
  abilities: () => [{ ability: "attack", symbol: "attacked" }],
});
