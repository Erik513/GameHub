import { spec } from "./step";
import { defineRole } from "./define";

export const drunk = defineRole({
  id: "drunk",
  steps: {
    drunkReveal: () => spec("drunkInfo", "info", { confirm: "drunkReady" }),
  },
});
