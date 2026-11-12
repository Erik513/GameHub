import type { ReactNode } from "react";
import type { TeamSetupMemory } from "../../business/shared/savedTeamSetup";
import { TeamSetupMemoryContext } from "./TeamSetupMemoryContext";

/** Gives every game the shared memory for the last teams and players. */
export function TeamSetupMemoryProvider({
  children,
  memory,
}: {
  readonly children: ReactNode;
  readonly memory: TeamSetupMemory | undefined;
}) {
  return (
    <TeamSetupMemoryContext.Provider value={memory}>{children}</TeamSetupMemoryContext.Provider>
  );
}
