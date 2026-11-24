import type { Match, Player, Role, VisibleRole } from "./stateTypes";

/** Questions about the players of a game: who is masked (the drunk), who has which role. */

export function isMasked(state: Match, player: Player): boolean {
  return state.drunk?.player === player.name && !state.drunk.revealed;
}

export function visibleRole(state: Match, player: Player): VisibleRole {
  return isMasked(state, player) ? "drunk" : player.role;
}

export function findActiveRole(
  state: Match,
  role: Role,
  players = state.alive,
): Player | undefined {
  return players.find((player) => visibleRole(state, player) === role);
}

export function playersWithRole(state: Match, role: Role): string[] {
  return state.alive
    .filter((player) => visibleRole(state, player) === role)
    .map((player) => player.name);
}

export function actingSeer(state: Match): Player | undefined {
  const seer = state.alive.find((player) => player.role === "seer");
  return seer ? findActiveRole(state, "seer") : findActiveRole(state, "apprenticeSeer");
}
