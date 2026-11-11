import { shuffle } from "./shuffle";

/** Splits free text (one name per line or separated by commas) into unique, trimmed player names. */
export function parsePlayers(text: string): string[] {
  const seen = new Set<string>();
  const players: string[] = [];
  for (const part of text.split(/[\n,;]/)) {
    const name = part.trim();
    const key = name.toLocaleLowerCase();
    if (name === "" || seen.has(key)) continue;
    seen.add(key);
    players.push(name);
  }
  return players;
}

/**
 * Deals the players to the given number of teams in random order, so team sizes differ by at
 * most one. Returns one list of players per team.
 */
export function splitIntoTeams(
  players: readonly string[],
  teamCount: number,
  random: () => number = Math.random,
): string[][] {
  const teams: string[][] = Array.from({ length: Math.max(0, Math.floor(teamCount)) }, () => []);
  if (teams.length === 0) return teams;
  shuffle(players, random).forEach((player, index) => {
    teams[index % teams.length]?.push(player);
  });
  return teams;
}
