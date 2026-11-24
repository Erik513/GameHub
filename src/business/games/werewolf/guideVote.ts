import { current, withSelection } from "./guideFrames";
import type { Guide, GuideSelection, GuideView } from "./guideTypes";
import { votingPlayers } from "./selectors";
import { voteMaximum, voteTotal, type WerewolfState } from "./stateMachine";

/**
 * At the vote: the narrator enters how many votes a nominated person got. The number is a whole number between 0 and the
 * votes there are; whether all votes were added up is shown in the view (the vote can only be confirmed then).
 */
export function setVoteCount(guide: Guide, name: string, count: number): Guide {
  const frame = current(guide);
  const state = guide.session.present;
  if (
    frame.phase !== "act" ||
    state.status !== "vote" ||
    !state.candidates.includes(name) ||
    !Number.isInteger(count) ||
    count < 0 ||
    count > voteTotal(state)
  )
    return guide;
  const counts = { ...(frame.selection.counts ?? {}), [name]: count };
  // With the double vote of the mayor the numbers can only add up to all votes minus one: the second vote is assigned
  // separately (and counts as one vote as soon as it is). Without it the numbers add up to all votes.
  const bonus = voteBonusOf(state, frame.selection);
  const reserved = bonus?.required || (bonus && bonus.chosen !== null) ? 1 : 0;
  const entered = Object.values(counts).reduce((sum, value) => sum + value, 0);
  if (entered + reserved > voteTotal(state)) return guide;
  // Nobody can get more votes than all votes minus his own (the second vote of the mayor counts for the person too).
  if (count + (frame.selection.bonus === name ? 1 : 0) > voteMaximum(state, name)) return guide;
  return withSelection(guide, { ...frame.selection, counts });
}

/** The nominated people who can get the second vote of the mayor with the double vote; null where there is no such vote. */
export function voteBonusOf(
  state: WerewolfState,
  selection: GuideSelection,
): GuideView["voteBonus"] {
  if (state.status !== "vote") return null;
  const mayor = votingPlayers(state).find(
    (player) => player.weight === 2 && player.choices.length > 0,
  );
  if (!mayor) return null;
  return {
    chosen: selection.bonus ?? null,
    choices: mayor.choices,
    mayor: mayor.name,
    // With several nominated people the second vote has to go to one of them; with one it is a yes vote or not.
    required: state.candidates.length > 1,
  };
}

/**
 * The second vote of the mayor with the double vote: the narrator taps the nominated person who gets it (tapping the
 * same person again takes it back; with one nominated person it is an additional yes vote or not).
 */
export function setVoteBonus(guide: Guide, candidate: string | null): Guide {
  const frame = current(guide);
  const state = guide.session.present;
  const bonus = voteBonusOf(state, frame.selection);
  if (frame.phase !== "act" || !bonus) return guide;
  if (candidate !== null && !bonus.choices.includes(candidate)) return guide;
  // The second vote counts as one more vote: it is only possible while the numbers leave room for it.
  const entered = Object.values(frame.selection.counts ?? {}).reduce(
    (sum, value) => sum + value,
    0,
  );
  if (candidate !== null && bonus.chosen === null && entered + 1 > voteTotal(state)) return guide;
  if (
    candidate !== null &&
    (frame.selection.counts?.[candidate] ?? 0) + 1 > voteMaximum(state, candidate)
  )
    return guide;
  const { bonus: previous, ...rest } = frame.selection;
  void previous;
  const next =
    candidate === null || candidate === bonus.chosen ? rest : { ...rest, bonus: candidate };
  return withSelection(guide, next);
}

export function voterNotesOf(state: WerewolfState): Record<string, "double" | "setByNarrator"> {
  const notes: Record<string, "double" | "setByNarrator"> = {};
  for (const player of votingPlayers(state)) {
    if (player.setByNarrator) notes[player.name] = "setByNarrator";
    else if (player.weight === 2) notes[player.name] = "double";
  }
  return notes;
}
