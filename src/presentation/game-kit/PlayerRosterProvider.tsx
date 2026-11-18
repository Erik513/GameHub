import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  addGroup,
  addPlayerToGroup,
  adoptUngroupedPlayers,
  removeGroup,
  removePlayerFromGroup,
  type PlayerBook,
  type PlayerGroupStore,
} from "../../business/shared/playerGroups";
import type { PlayerRosterStore } from "../../business/shared/playerRoster";
import { PlayerRosterContext, type PlayerRosterValue } from "./PlayerRosterContext";

/** Gives every screen the saved groups and players and saves each change right away. */
export function PlayerRosterProvider({
  children,
  defaultGroupName = "Players",
  groupStore,
  store,
}: {
  readonly children: ReactNode;
  /** The name of the group for players saved before groups existed. */
  readonly defaultGroupName?: string;
  /** Where the groups are kept; without it the groups work until the page is closed. */
  readonly groupStore?: PlayerGroupStore | undefined;
  readonly store: PlayerRosterStore | undefined;
}) {
  const [{ book, migrated }] = useState(() => {
    const saved: PlayerBook = { groups: groupStore?.read() ?? [], players: store?.read() ?? [] };
    const adopted = adoptUngroupedPlayers(saved, defaultGroupName);
    return { book: adopted, migrated: adopted !== saved };
  });
  const [current, setCurrent] = useState<PlayerBook>(book);

  // Players saved before groups existed were put into a group: keep that.
  useEffect(() => {
    if (migrated) {
      store?.write(book.players);
      groupStore?.write(book.groups);
    }
  }, [book, groupStore, migrated, store]);

  const value = useMemo<PlayerRosterValue | undefined>(() => {
    if (!store) return undefined;
    const save = (next: PlayerBook) => {
      setCurrent(next);
      store.write(next.players);
      groupStore?.write(next.groups);
    };
    return {
      addGroup(name) {
        const result = addGroup(current.groups, name);
        if (result.ok) save({ ...current, groups: result.groups });
        return result;
      },
      addPlayerToGroup(groupName, name) {
        const result = addPlayerToGroup(current, groupName, name);
        if (result.ok) save(result.book);
        return result;
      },
      groups: current.groups,
      players: current.players,
      removeGroup(name) {
        save(removeGroup(current, name));
      },
      removePlayerFromGroup(groupName, player) {
        save(removePlayerFromGroup(current, groupName, player));
      },
    };
  }, [current, groupStore, store]);

  return <PlayerRosterContext.Provider value={value}>{children}</PlayerRosterContext.Provider>;
}
