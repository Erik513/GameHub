import { defineRole } from "./define";

export const spellcaster = defineRole({
  id: "spellcaster",
  abilities: () => [{ ability: "silence", symbol: "silenced" }],
  variant: (settings) => (settings.allowSelfSilence ? "allowed" : "forbidden"),
});
