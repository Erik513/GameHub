import type { ReactNode } from "react";
import type { GameSettingsMemory } from "../../business/shared/gameSettingsMemory";
import { GameSettingsMemoryContext } from "./GameSettingsMemoryContext";

/** Gives every game the shared memory for its settings. */
export function GameSettingsMemoryProvider({
  children,
  memory,
}: {
  readonly children: ReactNode;
  readonly memory: GameSettingsMemory | undefined;
}) {
  return (
    <GameSettingsMemoryContext.Provider value={memory}>
      {children}
    </GameSettingsMemoryContext.Provider>
  );
}
