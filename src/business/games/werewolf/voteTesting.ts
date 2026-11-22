import type { WerewolfEvent, WerewolfState } from "./stateMachine";

/**
 * Helpers for the tests of the day vote: nominate people and let everybody vote. Not part of the game logic.
 */

/** The people who vote at the day: the living, except the silenced person. */
export function voterNames(state: WerewolfState): string[] {
  return state.alive
    .filter((player) => player.name !== state.silencedPlayer)
    .map((player) => player.name);
}

/** Everybody who can vote for somebody else votes for `target`; the target himself has no choice and no ballot. */
export function allVoteFor(state: WerewolfState, target: string): Record<string, string> {
  return Object.fromEntries(
    voterNames(state)
      .filter((name) => name !== target)
      .map((name) => [name, target]),
  );
}

/** The events that vote `target` out of the game: nominate him alone, everybody else votes for him. */
export function lynchEvents(state: WerewolfState, target: string): WerewolfEvent[] {
  const nomination = (state.status === "day" ? state.nomination : 0) + 1;
  return [
    { night: state.night, nominees: [target], type: "nominate" },
    { ballots: allVoteFor(state, target), night: state.night, nomination, type: "vote" },
  ];
}
