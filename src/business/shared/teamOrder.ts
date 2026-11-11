import { shuffle } from "./shuffle";

/** Returns a randomly ordered copy of the teams; the order is fixed for the whole game. */
export function shuffleTeams<T>(teams: readonly T[], random: () => number = Math.random): T[] {
  return shuffle(teams, random);
}
