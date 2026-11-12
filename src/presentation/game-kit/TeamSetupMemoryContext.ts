import { createContext, useContext } from "react";
import type { TeamSetupMemory } from "../../business/shared/savedTeamSetup";

export const TeamSetupMemoryContext = createContext<TeamSetupMemory | undefined>(undefined);

/** The shared memory for the last teams and players, or nothing when the app has none. */
export function useTeamSetupMemory(): TeamSetupMemory | undefined {
  return useContext(TeamSetupMemoryContext);
}
