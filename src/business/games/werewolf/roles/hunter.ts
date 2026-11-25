import { pick, spec } from "./step";
import { defineRole } from "./define";

export const hunter = defineRole({
  id: "hunter",
  steps: {
    hunter: (state) =>
      spec(
        state.settings.hunterShot === "required" ? "hunterRequired" : "hunterOptional",
        "choose",
        { skippable: state.settings.hunterShot !== "required", pick: pick("shot") },
      ),
    drunkHunter: (state) =>
      spec(
        state.settings.hunterShot === "required" ? "hunterRequired" : "hunterOptional",
        "choose",
        { skippable: state.settings.hunterShot !== "required", confirm: "drunkReady" },
      ),
  },
  abilityList: [{ ability: "shot", consumable: true, symbol: "shotDuty" }],
  variant: (settings) => settings.hunterShot,
});
