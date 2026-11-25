import { defineRole } from "./define";

export const paranormalInvestigator = defineRole({
  id: "paranormalInvestigator",
  abilities: () => [{ ability: "investigate", symbol: "investigation" }],
});
