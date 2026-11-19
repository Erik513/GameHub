import type { GameModule } from "../gameModule";
import { WerewolfGame } from "./WerewolfGame";

/** Wires Werewolf for the composition root. */
export function createWerewolfModule(): GameModule {
  return {
    id: "werewolf",
    Screen: () => <WerewolfGame />,
  };
}
