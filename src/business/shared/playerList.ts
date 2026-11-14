import { parsePlayers } from "./players";
import { capitalizePlayerName, maxPlayerNameLength, normalizePlayerName } from "./playerRoster";

const same = (left: string, right: string) =>
  left.toLocaleLowerCase() === right.toLocaleLowerCase();

/**
 * Adds the names typed into the "add player" field (one name, or several separated by commas or
 * line breaks) to the text of the player list. The first letter becomes a capital letter; a name
 * that is empty, too long or already in the list (ignoring case) is skipped.
 */
export function addPlayersToText(text: string, input: string): string {
  const players = parsePlayers(text);
  for (const part of input.split(/[\n,;]/u)) {
    const name = capitalizePlayerName(normalizePlayerName(part));
    if (name === "" || name.length > maxPlayerNameLength) continue;
    if (players.some((player) => same(player, name))) continue;
    players.push(name);
  }
  return players.join("\n");
}

/** Removes a player from the text of the player list. */
export function removePlayerFromText(text: string, name: string): string {
  return parsePlayers(text)
    .filter((player) => !same(player, name))
    .join("\n");
}
