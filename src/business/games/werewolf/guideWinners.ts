import type { WerewolfState } from "./stateMachine";

/** A group of players that won together. */
export interface WinnerGroup {
  readonly kind: "wolves" | "village" | "lovers" | "tanner";
  readonly players: readonly string[];
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
