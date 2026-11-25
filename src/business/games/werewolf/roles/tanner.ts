import { defineRole } from "./define";

export const tanner = defineRole({
  id: "tanner",
  variant: (settings) => settings.tanner,
});
