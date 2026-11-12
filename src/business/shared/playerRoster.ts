import { parsePlayers } from "./players";

/** The longest name of a player; the same limit as for team names. */
export const maxPlayerNameLength = 24;
/** The most players the list holds. */
export const maxRosterPlayers = 100;

/**
 * Where the saved players of the player list are kept. The list is shared by all games.
 * Implementations live outside the business layer (for example in the browser storage).
 */
export interface PlayerRosterStore {
  /** The saved names, empty if none were saved or the data is unusable. */
  read(): readonly string[];
  write(names: readonly string[]): void;
}

export type AddPlayerResult =
  | { readonly ok: true; readonly roster: readonly string[] }
  | { readonly ok: false; readonly reason: "empty" | "invalid" | "duplicate" | "full" };

/** Trims a name and replaces runs of white space by a single space. */
export function normalizePlayerName(raw: string): string {
  return raw.replace(/\s+/gu, " ").trim();
}

/** Makes the first letter of a name a capital letter; the rest is left as typed. */
export function capitalizePlayerName(name: string): string {
  const [first = ""] = name;
  return first.toLocaleUpperCase() + name.slice(first.length);
}

function sortNames(names: readonly string[]): string[] {
  return [...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

/**
 * Adds a player to the list. The first letter is made a capital letter and the names are kept
 * sorted; a name that exists already (ignoring case),
 * is too long or contains a separator of the free text field is refused.
 */
export function addPlayer(roster: readonly string[], raw: string): AddPlayerResult {
  const name = capitalizePlayerName(normalizePlayerName(raw));
  if (name === "") return { ok: false, reason: "empty" };
  if (name.length > maxPlayerNameLength || /[,;]/u.test(name)) {
    return { ok: false, reason: "invalid" };
  }
  const key = name.toLocaleLowerCase();
  if (roster.some((existing) => existing.toLocaleLowerCase() === key)) {
    return { ok: false, reason: "duplicate" };
  }
  if (roster.length >= maxRosterPlayers) return { ok: false, reason: "full" };
  return { ok: true, roster: sortNames([...roster, name]) };
}

export function removePlayer(roster: readonly string[], name: string): readonly string[] {
  return roster.filter((existing) => existing !== name);
}

/**
 * Reads saved data that came from outside (storage can hold anything): keeps only valid, unique
 * names and drops everything else.
 */
export function parseSavedRoster(raw: unknown): readonly string[] {
  if (!Array.isArray(raw)) return [];
  let roster: readonly string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const result = addPlayer(roster, item);
    if (result.ok) roster = result.roster;
  }
  return roster;
}

/**
 * Turns the choice from the player list into the text of the players field: chosen players are
 * added, deselected ones are removed, names typed by hand that are not in the list stay.
 */
export function applyRosterSelection(
  currentText: string,
  roster: readonly string[],
  selected: ReadonlySet<string>,
): string {
  const inRoster = new Set(roster.map((name) => name.toLocaleLowerCase()));
  const kept = parsePlayers(currentText).filter((name) => {
    const isFromRoster = inRoster.has(name.toLocaleLowerCase());
    return (
      !isFromRoster ||
      [...selected].some((chosen) => chosen.toLocaleLowerCase() === name.toLocaleLowerCase())
    );
  });
  const have = new Set(kept.map((name) => name.toLocaleLowerCase()));
  const added = roster.filter((name) => selected.has(name) && !have.has(name.toLocaleLowerCase()));
  return [...kept, ...added].join(", ");
}

/** The players of the list that are already in the players field. */
export function rosterPlayersIn(text: string, roster: readonly string[]): Set<string> {
  const present = new Set(parsePlayers(text).map((name) => name.toLocaleLowerCase()));
  return new Set(roster.filter((name) => present.has(name.toLocaleLowerCase())));
}
