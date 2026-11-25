import { spec } from "./step";
import { defineRole } from "./define";

export const drunk = defineRole({
  id: "drunk",
  steps: {
    drunkReveal: () => spec("drunkInfo", "info", { confirm: "drunkReady" }),
  },
  // At night: the step the role wakes in and its place in the night.
  night: { step: "drunk", place: 2, timing: "thirdNight" },
});
