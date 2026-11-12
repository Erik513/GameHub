import { useMemo, useState, type ReactNode } from "react";
import {
  addPlayer,
  removePlayer,
  type PlayerRosterStore,
} from "../../business/shared/playerRoster";
import { PlayerRosterContext, type PlayerRosterValue } from "./PlayerRosterContext";

/** Gives every screen the saved players and saves each change right away. */
export function PlayerRosterProvider({
  children,
  store,
}: {
  readonly children: ReactNode;
  readonly store: PlayerRosterStore | undefined;
}) {
  const [players, setPlayers] = useState<readonly string[]>(() => store?.read() ?? []);

  const value = useMemo<PlayerRosterValue | undefined>(() => {
    if (!store) return undefined;
    return {
      add(name) {
        const result = addPlayer(players, name);
        if (result.ok) {
          setPlayers(result.roster);
          store.write(result.roster);
        }
        return result;
      },
      players,
      remove(name) {
        const next = removePlayer(players, name);
        setPlayers(next);
        store.write(next);
      },
    };
  }, [players, store]);

  return <PlayerRosterContext.Provider value={value}>{children}</PlayerRosterContext.Provider>;
}
