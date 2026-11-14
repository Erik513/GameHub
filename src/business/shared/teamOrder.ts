import { shuffle } from "./shuffle";

/**
 * The playing order of the teams as the indexes of the teams (0-based), first team first. Anything
 * that is not a team of this game or repeated is dropped and the teams that are missing follow in
 * their normal order, so an empty list means "team 1, team 2, team 3 ...".
 */
export function normalizeOrder(order: readonly number[], count: number): number[] {
  const result: number[] = [];
  for (const team of order) {
    if (Number.isInteger(team) && team >= 0 && team < count && !result.includes(team)) {
      result.push(team);
    }
  }
  for (let team = 0; team < count; team += 1) {
    if (!result.includes(team)) result.push(team);
  }
  return result;
}

/** The normal order: team 1, then team 2, then team 3 and so on. */
export function isDefaultOrder(order: readonly number[], count: number): boolean {
  return normalizeOrder(order, count).every((team, place) => team === place);
}

/** Moves the team at place `from` to place `to` (0-based); the teams in between move by one place. */
export function moveTeam(
  order: readonly number[],
  count: number,
  from: number,
  to: number,
): number[] {
  const current = normalizeOrder(order, count);
  if (from < 0 || from >= count || to < 0 || to >= count || from === to) return current;
  const moved = current.splice(from, 1);
  current.splice(to, 0, ...moved);
  return current;
}

/** A random order of all teams; the first team of it starts. The random source can be injected. */
export function randomOrder(count: number, random: () => number = Math.random): number[] {
  return shuffle(
    Array.from({ length: Math.max(0, count) }, (_, team) => team),
    random,
  );
}
