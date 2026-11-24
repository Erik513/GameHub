import { describePlayers, type PlayerView } from "./selectors";
import type { WerewolfState } from "./stateMachine";

/** A group of players that won together. */
export interface WinnerGroup {
  readonly kind: "wolves" | "village" | "lovers" | "tanner";
  readonly players: readonly string[];
}

/** A category of the end of the game: a group of winners or the losers, each person in exactly one of them. */
export interface StandingsGroup {
  readonly kind: WinnerGroup["kind"] | "losers";
  readonly players: readonly PlayerView[];
}

/**
 * The end of the game with every person once: the groups of the winners first (the winning side, the lovers, the tanner),
 * then the losers. A person who belongs to a special group (the lovers, the tanner) stands there and not again in the
 * winning side. Inside every group the living come first (by name), then the dead, the one who died last first and the
 * one who died first at the very end.
 */
export function describeStandings(state: WerewolfState): readonly StandingsGroup[] {
  if (state.status !== "finished") return [];
  const people = new Map(describePlayers(state).map((person) => [person.name, person]));
  const winners = describeWinners(state);
  // The special groups take their people first, so nobody stands twice.
  const special = new Set(
    winners.filter((group) => group.kind !== state.winner).flatMap((group) => group.players),
  );
  const taken = new Set<string>();
  const groups: StandingsGroup[] = [];
  for (const group of winners) {
    const names =
      group.kind === state.winner ? group.players.filter((n) => !special.has(n)) : group.players;
    const players = names.flatMap((name) =>
      people.get(name) && !taken.has(name) ? [people.get(name)!] : [],
    );
    players.forEach((person) => taken.add(person.name));
    if (players.length > 0) groups.push({ kind: group.kind, players: inStandingOrder(players) });
  }
  const losers = [...people.values()].filter((person) => !taken.has(person.name));
  if (losers.length > 0) groups.push({ kind: "losers", players: inStandingOrder(losers) });
  return groups;
}

function inStandingOrder(players: readonly PlayerView[]): readonly PlayerView[] {
  const byName = (one: PlayerView, other: PlayerView) =>
    one.name.localeCompare(other.name, undefined, { sensitivity: "base" });
  const living = players.filter((person) => person.tone !== "dead").sort(byName);
  // The entries of the history are numbered in the order they happened: the later the death, the higher the number.
  const dead = players
    .filter((person) => person.tone === "dead")
    .sort((one, other) => (other.death?.id ?? 0) - (one.death?.id ?? 0) || byName(one, other));
  return [...living, ...dead];
}

/**
 * Who won, for the one and only winner view at the very end of the game: the winning side (all its players, also the
 * ones who left the game), the lovers when both are still in the game, and the tanner when he reached his own goal.
 * The tanner stands in his own group instead of in the village.
 */
export function describeWinners(state: WerewolfState): readonly WinnerGroup[] {
  if (state.status !== "finished") return [];
  const side = state.players.filter((p) =>
    state.winner === "wolves" ? p.role === "wolf" : p.role !== "wolf",
  );
  const groups: WinnerGroup[] = [
    {
      kind: state.winner,
      players: side.filter((p) => p.name !== state.tannerWinner).map((p) => p.name),
    },
  ];
  const { lovers } = state;
  if (lovers?.every((name) => state.alive.some((p) => p.name === name)))
    groups.push({ kind: "lovers", players: [...lovers] });
  if (state.tannerWinner) groups.push({ kind: "tanner", players: [state.tannerWinner] });
  return groups.filter((group) => group.players.length > 0);
}
