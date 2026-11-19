import { werewolfPlayerLimits } from "./configuration";

/**
 * Who takes part in a Werewolf match and where everybody sits. The narrator is one of the
 * participants, plays no role and has no seat in the circle; the other participants are the players.
 */
export interface WerewolfLineup {
  /** Everybody who takes part, the narrator included, in the order they were added. */
  readonly participants: readonly string[];
  /** The narrator, or null when nobody is chosen yet. Always one of the participants. */
  readonly narrator: string | null;
  /** The players (the participants without the narrator) in the order they really sit. */
  readonly seats: readonly string[];
}

export type WerewolfLineupIssue =
  | { readonly code: "noNarrator" }
  | { readonly code: "tooFew"; readonly count: number; readonly minimum: number }
  | { readonly code: "tooMany"; readonly count: number; readonly maximum: number };

export const emptyWerewolfLineup: WerewolfLineup = { narrator: null, participants: [], seats: [] };

/**
 * Brings the parts into line: the narrator must take part; the seats hold exactly the players, the
 * known ones in their seat order and new players behind them (in the order they were added).
 */
function normalize(
  participants: readonly string[],
  narrator: string | null,
  seats: readonly string[],
): WerewolfLineup {
  const chosen = narrator !== null && participants.includes(narrator) ? narrator : null;
  const kept = seats.filter((name) => participants.includes(name) && name !== chosen);
  const added = participants.filter((name) => name !== chosen && !kept.includes(name));
  return { narrator: chosen, participants, seats: [...kept, ...added] };
}

/** Replaces the participants (for example after a choice from the saved players). */
export function setParticipants(
  lineup: WerewolfLineup,
  participants: readonly string[],
): WerewolfLineup {
  return normalize(participants, lineup.narrator, lineup.seats);
}

/** Adds names that are not there yet; they take the last seats. */
export function addParticipants(lineup: WerewolfLineup, names: readonly string[]): WerewolfLineup {
  const known = new Set(lineup.participants.map((name) => name.toLocaleLowerCase()));
  const added: string[] = [];
  for (const name of names) {
    if (known.has(name.toLocaleLowerCase())) continue;
    known.add(name.toLocaleLowerCase());
    added.push(name);
  }
  return setParticipants(lineup, [...lineup.participants, ...added]);
}

/** Removes a participant; a narrator who is removed leaves no narrator. */
export function removeParticipant(lineup: WerewolfLineup, name: string): WerewolfLineup {
  return setParticipants(
    lineup,
    lineup.participants.filter((participant) => participant !== name),
  );
}

/**
 * Chooses the narrator among the participants (or nobody with `null`). The narrator leaves the seats;
 * the narrator of before sits down again behind the last player. Nobody else is moved.
 */
export function chooseNarrator(lineup: WerewolfLineup, name: string | null): WerewolfLineup {
  if (name !== null && !lineup.participants.includes(name)) return lineup;
  return normalize(lineup.participants, name, lineup.seats);
}

/** Moves a player to another seat (the index counts from the first seat, 0); other seats shift. */
export function moveSeat(lineup: WerewolfLineup, name: string, toIndex: number): WerewolfLineup {
  const from = lineup.seats.indexOf(name);
  if (from === -1) return lineup;
  const target = Math.min(Math.max(Math.trunc(toIndex), 0), lineup.seats.length - 1);
  if (target === from) return lineup;
  const seats = lineup.seats.filter((seat) => seat !== name);
  seats.splice(target, 0, name);
  return { ...lineup, seats };
}

/** What stops the match from starting: no narrator, or fewer than six or more than twenty players. */
export function werewolfLineupIssues(lineup: WerewolfLineup): readonly WerewolfLineupIssue[] {
  const issues: WerewolfLineupIssue[] = [];
  if (lineup.narrator === null) issues.push({ code: "noNarrator" });
  const count = lineup.seats.length;
  if (count < werewolfPlayerLimits.minimum)
    issues.push({ code: "tooFew", count, minimum: werewolfPlayerLimits.minimum });
  if (count > werewolfPlayerLimits.targetMaximum)
    issues.push({ code: "tooMany", count, maximum: werewolfPlayerLimits.targetMaximum });
  return issues;
}
