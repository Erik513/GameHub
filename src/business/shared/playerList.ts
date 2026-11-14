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

/**
 * The team that has the fewest players, the first one when several are equal. A tap on a player
 * without a team puts him there, which keeps the teams even.
 */
export function smallestTeamIndex(
  assignment: Readonly<Record<string, number>>,
  teamCount: number,
): number | undefined {
  if (teamCount < 1) return undefined;
  const sizes = Array.from({ length: teamCount }, () => 0);
  for (const team of Object.values(assignment)) {
    if (team >= 0 && team < teamCount) sizes[team] = (sizes[team] ?? 0) + 1;
  }
  return sizes.indexOf(Math.min(...sizes));
}
