import {
  addPlayer,
  capitalizePlayerName,
  maxPlayerNameLength,
  normalizePlayerName,
} from "./playerRoster";

/** The most groups the player list holds. */
export const maxPlayerGroups = 8;

/** A named group of saved players (for example a circle of friends). A player may be in several groups. */
export interface PlayerGroup {
  readonly name: string;
  /** The names of the players, always a subset of the player list. */
  readonly members: readonly string[];
}

/**
 * Where the groups of the player list are kept. Implementations live outside the business layer
 * (for example in the browser storage).
 */
export interface PlayerGroupStore {
  /** The saved groups, empty if none were saved or the data is unusable. */
  read(): readonly PlayerGroup[];
  write(groups: readonly PlayerGroup[]): void;
}

export type AddGroupResult =
  | { readonly ok: true; readonly groups: readonly PlayerGroup[] }
  | { readonly ok: false; readonly reason: "empty" | "invalid" | "duplicate" | "full" };

function sameName(a: string, b: string): boolean {
  return a.toLocaleLowerCase() === b.toLocaleLowerCase();
}

/**
 * Adds an empty group. The name follows the rules of player names (first letter a capital letter, no
 * separator of the free text field, at most 24 characters); the groups are kept sorted by name and a
 * name that exists already (ignoring case) is refused.
 */
export function addGroup(groups: readonly PlayerGroup[], raw: string): AddGroupResult {
  const name = capitalizePlayerName(normalizePlayerName(raw));
  if (name === "") return { ok: false, reason: "empty" };
  if (name.length > maxPlayerNameLength || /[,;]/u.test(name)) {
    return { ok: false, reason: "invalid" };
  }
  if (groups.some((group) => sameName(group.name, name))) return { ok: false, reason: "duplicate" };
  if (groups.length >= maxPlayerGroups) return { ok: false, reason: "full" };
  const next = [...groups, { name, members: [] }].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
  return { ok: true, groups: next };
}

/**
 * All saved players and their groups. Every player is in at least one group: players are only
 * added to a group, and a player who leaves the last group is removed from the list.
 */
export interface PlayerBook {
  readonly groups: readonly PlayerGroup[];
  readonly players: readonly string[];
}

export type AddMemberResult =
  | { readonly ok: true; readonly book: PlayerBook }
  | { readonly ok: false; readonly reason: "empty" | "invalid" | "duplicate" | "full" };

function stillInAGroup(groups: readonly PlayerGroup[], player: string): boolean {
  return groups.some((group) => group.members.includes(player));
}

/**
 * Adds a player to a group. A name that exists already (ignoring case, for example from another group)
 * is the same person and is only added to this group; a new name follows the rules of the player list.
 */
export function addPlayerToGroup(
  book: PlayerBook,
  groupName: string,
  raw: string,
): AddMemberResult {
  const group = book.groups.find((candidate) => candidate.name === groupName);
  if (!group) return { ok: false, reason: "invalid" };
  const typed = capitalizePlayerName(normalizePlayerName(raw));
  let players = book.players;
  let name = players.find((existing) => sameName(existing, typed));
  if (name === undefined) {
    const added = addPlayer(players, raw);
    if (!added.ok) return added;
    players = added.roster;
    name = players.find((existing) => sameName(existing, typed)) ?? typed;
  }
  if (group.members.includes(name)) return { ok: false, reason: "duplicate" };
  const member = name;
  const groups = book.groups.map((candidate) =>
    candidate === group ? { ...candidate, members: [...candidate.members, member] } : candidate,
  );
  return { ok: true, book: { groups, players } };
}

/** Takes a player out of a group; a player who is in no group anymore is removed from the list. */
export function removePlayerFromGroup(
  book: PlayerBook,
  groupName: string,
  player: string,
): PlayerBook {
  const groups = book.groups.map((group) =>
    group.name === groupName
      ? { ...group, members: group.members.filter((member) => member !== player) }
      : group,
  );
  return { groups, players: book.players.filter((name) => stillInAGroup(groups, name)) };
}

/** Deletes a group; players who were only in this group are removed from the list. */
export function removeGroup(book: PlayerBook, groupName: string): PlayerBook {
  const groups = book.groups.filter((group) => group.name !== groupName);
  return { groups, players: book.players.filter((name) => stillInAGroup(groups, name)) };
}

/**
 * Puts players who are in no group (saved before groups existed) into a group of their own, or into the
 * first group when there is no room for another group.
 */
export function adoptUngroupedPlayers(book: PlayerBook, groupName: string): PlayerBook {
  const loose = book.players.filter((player) => !stillInAGroup(book.groups, player));
  if (loose.length === 0) return book;
  const added = addGroup(book.groups, groupName);
  if (added.ok) {
    return {
      groups: added.groups.map((group) =>
        group.name === capitalizePlayerName(normalizePlayerName(groupName))
          ? { ...group, members: loose }
          : group,
      ),
      players: book.players,
    };
  }
  const [first, ...others] = book.groups;
  return first
    ? {
        groups: [{ ...first, members: [...first.members, ...loose] }, ...others],
        players: book.players,
      }
    : book;
}

/** The players of a group in the order of the player list; an unknown group has no players. */
export function groupPlayers(
  groups: readonly PlayerGroup[],
  groupName: string,
  roster: readonly string[],
): readonly string[] {
  const members = groups.find((group) => group.name === groupName)?.members ?? [];
  return roster.filter((player) => members.includes(player));
}

/**
 * Reads saved data that came from outside (storage can hold anything): keeps valid, unique groups
 * and, in each, only members that are in the player list.
 */
export function parseSavedGroups(raw: unknown, roster: readonly string[]): readonly PlayerGroup[] {
  if (!Array.isArray(raw)) return [];
  let groups: readonly PlayerGroup[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const { name, members } = item as { name?: unknown; members?: unknown };
    if (typeof name !== "string") continue;
    const added = addGroup(groups, name);
    if (!added.ok) continue;
    const wanted = Array.isArray(members) ? members : [];
    const kept = roster.filter((player) => wanted.includes(player));
    groups = added.groups.map((group) =>
      group.name === capitalizePlayerName(normalizePlayerName(name))
        ? { ...group, members: kept }
        : group,
    );
  }
  return groups;
}
