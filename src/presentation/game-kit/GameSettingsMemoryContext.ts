import { createContext, useContext } from "react";
import type { GameSettingsMemory } from "../../business/shared/gameSettingsMemory";

export const GameSettingsMemoryContext = createContext<GameSettingsMemory | undefined>(undefined);

/** The shared memory for the settings of the games, or nothing when the app has none. */
export function useGameSettingsMemory(): GameSettingsMemory | undefined {
  return useContext(GameSettingsMemoryContext);
}
