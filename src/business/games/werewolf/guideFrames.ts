import { describeNarratorCard } from "./narratorCard";
import {
  emptySelection,
  type Guide,
  type GuideFrame,
  type GuidePhase,
  type GuideSelection,
} from "./guideTypes";
import type { WerewolfSession } from "./session";
import { type WerewolfState } from "./stateMachine";

/** The frames of the guide: where a step starts and how the current frame is read and replaced. */

export function phaseOf(state: WerewolfState): GuidePhase {
  const card = describeNarratorCard(state);
  // Nobody wakes up during the day: its card is open at once. The hunter acts in public (everybody is awake and sees
  // it): his card is open at once as well.
  return !card ? "plain" : card.role === "day" || card.role === "hunter" ? "act" : "intro";
}

/** The vote opens at once; nobody has chosen yet. */
export function initialSelection(state: WerewolfState): GuideSelection {
  if (state.status === "witch" || state.status === "magician")
    return { ...emptySelection, question: "heal" };
  return state.status === "vote" ? { ...emptySelection, ability: "vote" } : emptySelection;
}

export function frameOf(state: WerewolfState, pastLength: number): GuideFrame {
  return { event: null, pastLength, phase: phaseOf(state), selection: initialSelection(state) };
}

/** True right after the last player has looked at the role: the game is dealt but not begun. */
export function justDealt(session: WerewolfSession): boolean {
  const last = session.past[session.past.length - 1];
  return last?.status === "roles" && session.present.status !== "roles";
}

export function current(guide: Guide): GuideFrame {
  return guide.trail[guide.trail.length - 1]!;
}

export function replaceCurrent(guide: Guide, frame: GuideFrame): Guide {
  return { ...guide, trail: [...guide.trail.slice(0, -1), frame] };
}

export function withSelection(guide: Guide, selection: GuideSelection): Guide {
  return replaceCurrent(guide, { ...current(guide), selection });
}
