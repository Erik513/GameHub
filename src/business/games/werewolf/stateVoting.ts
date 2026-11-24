import { findActiveRole } from "./stateQueries";
import type { Match, Player, WerewolfState } from "./stateTypes";

/** The count of a vote: who votes, how many votes there are, who leads, who is needed. */

/** The people who vote at the day: the living, except the silenced person. */
export function dayVoters(state: Match): readonly Player[] {
  return state.alive.filter((player) => player.name !== state.silencedPlayer);
}

/**
 * Counts the ballots of a vote. Returns null when the ballots are not valid: every voter who can vote for somebody other
 * than himself has to name one candidate (never himself), and nobody else votes. The mayor with the double vote counts
 * twice. The leaders are all candidates with the most votes.
 */
export function countBallots(
  state: Match,
  candidates: readonly string[],
  ballots: Readonly<Record<string, string>>,
): { readonly leaders: readonly string[]; readonly rejected?: true } | null {
  const voters = dayVoters(state);
  const mayor =
    state.settings.mayor === "doubleVote" ? findActiveRole(state, "mayor", voters) : undefined;
  if (Object.keys(ballots).some((name) => !voters.some((voter) => voter.name === name)))
    return null;
  const tally = new Map<string, number>(candidates.map((name) => [name, 0]));
  for (const voter of voters) {
    const choices = candidates.filter((name) => name !== voter.name);
    if (choices.length === 0) {
      if (voter.name in ballots) return null;
      continue;
    }
    const choice = ballots[voter.name];
    if (choice === undefined || !choices.includes(choice)) return null;
    tally.set(choice, (tally.get(choice) ?? 0) + (voter.name === mayor?.name ? 2 : 1));
  }
  const most = Math.max(...tally.values());
  return { leaders: candidates.filter((name) => tally.get(name) === most) };
}

/**
 * The votes that have to be counted in a vote: the weights of all voting people who can vote for somebody other than
 * themselves (the silenced person does not vote, the mayor with the double vote counts twice).
 */
export function voteTotal(state: WerewolfState): number {
  if (state.status !== "vote") return 0;
  // One nominated person: the votes to enter are the yes votes; he does not vote for his own execution.
  if (state.candidates.length === 1) return singleVote(state).maxYes;
  const voters = dayVoters(state);
  const mayor =
    state.settings.mayor === "doubleVote" ? findActiveRole(state, "mayor", voters) : undefined;
  return voters
    .filter((voter) => state.candidates.some((name) => name !== voter.name))
    .reduce((sum, voter) => sum + (voter.name === mayor?.name ? 2 : 1), 0);
}

/**
 * The vote about one nominated person (yes or no, as in Ultimate Werewolf): all people who vote count, the nominated
 * person too, the silenced one not; the mayor with the double vote counts twice. The person leaves the game when more
 * than half of those votes are yes.
 */
export function singleVote(
  state: Match,
  candidates: readonly string[] = (state as { candidates?: readonly string[] }).candidates ?? [],
): { readonly maxYes: number; readonly needed: number; readonly total: number } {
  const voters = dayVoters(state);
  const mayor =
    state.settings.mayor === "doubleVote" ? findActiveRole(state, "mayor", voters) : undefined;
  const weightOf = (name: string) => (name === mayor?.name ? 2 : 1);
  const total = voters.reduce((sum, voter) => sum + weightOf(voter.name), 0);
  const only = candidates[0];
  // The nominated person does not vote for his own execution.
  const own =
    only !== undefined && voters.some((voter) => voter.name === only) ? weightOf(only) : 0;
  // Only the votes that can be cast count: the nominated person does not vote for his own execution. More yes than no
  // votes among them (more than half) sends him out; as many yes as no votes is a tie.
  const cast = total - own;
  return { maxYes: cast, needed: Math.floor(cast / 2) + 1, total };
}

/**
 * The most votes one nominated person can get in the vote: all votes minus his own (he does not vote for himself; the
 * mayor with the double vote has two votes of his own). With one nominated person these are the yes votes.
 */
export function voteMaximum(state: WerewolfState, name: string): number {
  if (state.status !== "vote") return 0;
  if (state.candidates.length === 1) return singleVote(state).maxYes;
  const voters = dayVoters(state);
  const mayor =
    state.settings.mayor === "doubleVote" ? findActiveRole(state, "mayor", voters) : undefined;
  const own = voters.some((voter) => voter.name === name);
  return voteTotal(state) - (own ? (name === mayor?.name ? 2 : 1) : 0);
}

/**
 * One nominated person: the number of yes votes that is a tie (as many yes as no votes), or null when there is none (an
 * odd number of votes, or not one nominated person).
 */
export function voteTieAt(state: WerewolfState): number | null {
  if (state.status !== "vote" || state.candidates.length !== 1) return null;
  const { maxYes } = singleVote(state);
  return maxYes > 0 && maxYes % 2 === 0 ? maxYes / 2 : null;
}

/** The yes votes that are needed for the one nominated person to leave the game (0 when several are nominated). */
export function voteNeeded(state: WerewolfState): number {
  return state.status === "vote" && state.candidates.length === 1 ? singleVote(state).needed : 0;
}

/**
 * Counts a vote that was entered per candidate. Several candidates: every candidate needs a whole number of votes, all
 * votes have to be added up exactly, and nobody votes for himself (a candidate who votes cannot have all votes); the
 * most votes win. One candidate: the yes votes are entered; he leaves the game when they are more than half of the
 * votes cast (leaders is then empty when he stays; `tie` when yes and no votes are equal).
 */
export function countVotes(
  state: Match,
  candidates: readonly string[],
  counts: Readonly<Record<string, number>>,
): {
  readonly leaders: readonly string[];
  readonly rejected?: true;
  /** One nominated person: exactly as many yes as no votes (the vote is held once more). */
  readonly tie?: true;
} | null {
  if (Object.keys(counts).length !== candidates.length) return null;
  if (!candidates.every((name) => Number.isInteger(counts[name]) && counts[name]! >= 0))
    return null;
  if (candidates.length === 1) {
    const only = candidates[0]!;
    const { maxYes, needed } = singleVote(state, candidates);
    if (counts[only]! > maxYes) return null;
    if (counts[only]! >= needed) return { leaders: [only] };
    // As many yes as no votes among the votes cast (the nominated person does not vote): a tie.
    return maxYes > 0 && counts[only]! * 2 === maxYes
      ? { leaders: [], rejected: true, tie: true }
      : { leaders: [], rejected: true };
  }
  const voters = dayVoters(state);
  const mayor =
    state.settings.mayor === "doubleVote" ? findActiveRole(state, "mayor", voters) : undefined;
  const weightOf = (name: string) => (name === mayor?.name ? 2 : 1);
  const withChoice = voters.filter((voter) => candidates.some((name) => name !== voter.name));
  const total = withChoice.reduce((sum, voter) => sum + weightOf(voter.name), 0);
  const sum = candidates.reduce((all, name) => all + counts[name]!, 0);
  if (sum !== total) return null;
  // A candidate does not vote for himself: he cannot get the votes of everybody including his own.
  for (const name of candidates) {
    const own = withChoice.find((voter) => voter.name === name);
    if (counts[name]! > total - (own ? weightOf(name) : 0)) return null;
  }
  const most = Math.max(...candidates.map((name) => counts[name]!));
  return { leaders: candidates.filter((name) => counts[name] === most) };
}
