import { describeNarratorCard, type CardAbilityId, type NarratorCard } from "./narratorCard";
import {
  validNominators,
  validSeconders,
  validTargets,
  votingPlayers,
  type WerewolfTargetAction,
} from "./selectors";
import { advanceWerewolfSession, undoWerewolfSession, type WerewolfSession } from "./session";
import { transitionWerewolf, type WerewolfEvent, type WerewolfState } from "./stateMachine";

/**
 * The guide of the narrator: which instruction the lower box shows and what the narrator can do.
 *
 * - intro: "the role wakes up"; the narrator taps and the upper box shows the role.
 * - act: the narrator uses an ability (or only confirms); the choice is kept here and reaches the game on "continue".
 * - outro: "the role falls asleep again"; the choice is handed to the game on "continue".
 * - plain: a step without an awake role (the role reveal, the morning, the day).
 *
 * Every phase is one step of the trail, so "back" is exactly one step: inside a role, back to the previous role, or
 * back into the day. The game itself only moves on a confirmed event, so going back never replays randomness.
 */
export type GuidePhase = "intro" | "act" | "outro" | "plain";

export interface GuideSelection {
  /** The ability whose targets are shown. */
  readonly ability: CardAbilityId | null;
  /** The healing potion or the healing spell is used. */
  readonly heal: boolean;
  readonly picks: readonly string[];
  /** The narrator chose "nobody" where that is allowed. */
  readonly none: boolean;
}

export const emptySelection: GuideSelection = {
  ability: null,
  heal: false,
  none: false,
  picks: [],
};

export interface GuideFrame {
  readonly phase: GuidePhase;
  /** How many steps the game had behind it when the frame was made: going back past it undoes one game step. */
  readonly pastLength: number;
  readonly selection: GuideSelection;
  /** The event that the outro hands to the game. */
  readonly event: WerewolfEvent | null;
}

export interface Guide {
  readonly session: WerewolfSession;
  readonly trail: readonly GuideFrame[];
}

const abilityAction: Partial<Record<CardAbilityId, WerewolfTargetAction>> = {
  attack: "attack",
  bond: "bond",
  hammer: "hammer",
  inspect: "inspect",
  investigate: "investigate",
  kill: "kill",
  passAmulet: "passAmulet",
  poison: "poison",
  protect: "protect",
  shot: "shot",
  silence: "silence",
  stayWith: "stayWith",
};
/** Abilities that may also be used on nobody. */
const mayChooseNobody: readonly CardAbilityId[] = [
  "attack",
  "hammer",
  "investigate",
  "shot",
  "silence",
];

function phaseOf(state: WerewolfState): GuidePhase {
  const card = describeNarratorCard(state);
  // Nobody wakes up during the day: its card is open at once.
  return !card ? "plain" : card.role === "day" ? "act" : "intro";
}

/** The vote starts with the people who have to vote yes already chosen. */
function initialSelection(state: WerewolfState): GuideSelection {
  return state.status === "vote"
    ? {
        ...emptySelection,
        ability: "vote",
        picks: votingPlayers(state)
          .filter((player) => player.requiredYes)
          .map((player) => player.name),
      }
    : emptySelection;
}

function frameOf(state: WerewolfState, pastLength: number): GuideFrame {
  return { event: null, pastLength, phase: phaseOf(state), selection: initialSelection(state) };
}

export function createGuide(session: WerewolfSession): Guide {
  return { session, trail: [frameOf(session.present, session.past.length)] };
}

function current(guide: Guide): GuideFrame {
  return guide.trail[guide.trail.length - 1]!;
}

/** The event that the choice of the narrator stands for, or null while something is missing. */
function eventOf(state: WerewolfState, selection: GuideSelection): WerewolfEvent | null {
  const { night } = state;
  const first = selection.picks[0];
  const target = first ?? null;
  const decided = first !== undefined || selection.none;
  switch (state.status) {
    case "roles": {
      const player = state.players[state.index];
      return player ? { player: player.name, type: "roleSeen" } : null;
    }
    case "nightCall":
      return { night, type: "acknowledgeCall" };
    case "lovers":
      return { night, type: "loversReady" };
    case "amuletIntro":
      return { night, type: "amuletReady" };
    case "drunkReveal":
    case "drunkHunter":
      return { night, type: "drunkReady" };
    case "vision":
      return { night, type: "closeVision" };
    case "investigation":
      return { night, type: "closeInvestigation" };
    case "morning":
      return { night, type: "announceMorning" };
    case "exile":
      return { night, type: "announceExile" };
    case "day":
      if (selection.picks.length === 0) return { night, type: "endDay" };
      return selection.picks.length === 3
        ? {
            night,
            nominator: selection.picks[1]!,
            seconder: selection.picks[2]!,
            target: selection.picks[0]!,
            type: "nominate",
          }
        : null;
    case "vote":
      return { night, nomination: state.nomination, type: "vote", yesVoters: selection.picks };
    case "wolves":
      if (state.night === 1 && !state.settings.attackOnFirstNight)
        return { night, type: "wolvesReady" };
      return decided ? { night, target, type: "attack" } : null;
    case "witch":
      return { heal: selection.heal, night, poison: target, type: "potions" };
    case "magician":
      return { heal: selection.heal, kill: selection.picks, night, type: "castSpells" };
    case "seer":
      return first ? { night, target: first, type: "inspect" } : null;
    case "investigator":
      return decided ? { night, target, type: "investigate" } : null;
    case "bodyguard":
      return first ? { night, target: first, type: "protect" } : null;
    case "nightGuest":
      return first ? { night, target: first, type: "stayWith" } : null;
    case "mayor":
      return decided ? { night, target, type: "hammer" } : null;
    case "spellcaster":
      return decided ? { night, target, type: "silence" } : null;
    case "hunter":
      return decided ? { night, target, type: "shot" } : null;
    case "amuletPass":
      return first ? { night, target: first, type: "passAmulet" } : null;
    case "cupid": {
      const [one, two] = selection.picks;
      return one && two ? { night, players: [one, two], type: "bond" } : null;
    }
    default:
      return null;
  }
}

/** The event only counts when the game accepts it. */
function acceptedEvent(state: WerewolfState, selection: GuideSelection): WerewolfEvent | null {
  const event = eventOf(state, selection);
  return event && transitionWerewolf(state, event) !== state ? event : null;
}

function roleOf(state: WerewolfState) {
  return describeNarratorCard(state)?.role ?? null;
}

/** How many targets an ability takes, and whether it can be left without one. */
function pickLimit(state: WerewolfState, selection: GuideSelection): number {
  if (selection.ability === "vote")
    return state.status === "vote" ? votingPlayers(state).length : 3;
  if (selection.ability === "bond") return 2;
  if (selection.ability === "kill")
    return Math.max(0, state.spellsRemaining - Number(selection.heal));
  return 1;
}

export interface GuideView {
  /** What the "next" button says: the day ends, the vote starts or ends, or simply "next". */
  readonly nextKind: "endDay" | "endVote" | "next" | "startVote";
  readonly phase: GuidePhase;
  readonly state: WerewolfState;
  /** The role that is awake (also in the outro, where it is falling asleep); null in a plain step. */
  readonly card: NarratorCard | null;
  readonly selection: GuideSelection;
  /** The people the narrator can choose now; empty while no ability is open. */
  readonly targets: readonly string[];
  readonly canChooseNobody: boolean;
  readonly canContinue: boolean;
  readonly canGoBack: boolean;
  /** There is a choice that "undo" can take back. */
  readonly canUndo: boolean;
}

export function describeGuide(guide: Guide): GuideView {
  const frame = current(guide);
  const state = guide.session.present;
  const { selection } = frame;
  const action = selection.ability ? abilityAction[selection.ability] : undefined;
  let targets: readonly string[] = [];
  if (frame.phase === "act" && selection.ability === "vote") {
    const [nominee, nominator] = selection.picks;
    targets =
      state.status === "vote"
        ? votingPlayers(state).map((player) => player.name)
        : selection.picks.length >= 3
          ? []
          : nominee === undefined
            ? validTargets(state, "nominate")
            : nominator === undefined
              ? validNominators(state, nominee)
              : validSeconders(state, nominee, nominator);
    targets = targets.filter((name) => !selection.picks.includes(name));
  } else if (frame.phase === "act" && action)
    targets = validTargets(state, action, {
      heal: selection.heal,
      selected: selection.ability === "bond" ? selection.picks.slice(0, 1) : selection.picks,
    }).filter((name) => !selection.picks.includes(name));
  const canContinue =
    frame.phase === "intro" ||
    frame.phase === "outro" ||
    ((frame.phase === "act" || frame.phase === "plain") &&
      acceptedEvent(state, selection) !== null);
  return {
    canChooseNobody:
      frame.phase === "act" &&
      selection.ability !== null &&
      mayChooseNobody.includes(selection.ability) &&
      !(selection.ability === "shot" && state.settings.hunterShot === "required"),
    canContinue,
    canGoBack: guide.trail.length > 1 || guide.session.past.length > 0,
    canUndo:
      selection.picks.length > initialSelection(state).picks.length ||
      selection.heal ||
      selection.none,
    card: describeNarratorCard(state),
    nextKind:
      state.status === "vote"
        ? "endVote"
        : state.status === "day"
          ? selection.picks.length === 3
            ? "startVote"
            : "endDay"
          : "next",
    phase: frame.phase,
    selection,
    state,
    targets,
  };
}

function replaceCurrent(guide: Guide, frame: GuideFrame): Guide {
  return { ...guide, trail: [...guide.trail.slice(0, -1), frame] };
}

function withSelection(guide: Guide, selection: GuideSelection): Guide {
  return replaceCurrent(guide, { ...current(guide), selection });
}

/** The narrator taps an ability. Healing is a switch; the others open their targets. */
export function chooseAbility(guide: Guide, id: CardAbilityId): Guide {
  const frame = current(guide);
  const state = guide.session.present;
  if (frame.phase !== "act") return guide;
  const card = describeNarratorCard(state);
  if (!card?.abilities.some((ability) => ability.id === id && ability.available)) return guide;
  const { selection } = frame;
  if (id === "heal") {
    const next = { ...selection, heal: !selection.heal };
    // The game decides whether there is somebody to heal; a choice it would refuse is not taken.
    if (next.heal && eventOf(state, next) && !acceptedEvent(state, next)) return guide;
    return withSelection(guide, next);
  }
  return withSelection(guide, { ...selection, ability: id, none: false, picks: [] });
}

/** The narrator taps a person in the list. */
export function choosePlayer(guide: Guide, name: string): Guide {
  const view = describeGuide(guide);
  if (!view.targets.includes(name)) return guide;
  const { selection } = view;
  const limit = pickLimit(view.state, selection);
  const picks = limit === 1 ? [name] : [...selection.picks, name].slice(0, limit);
  return withSelection(guide, { ...selection, none: false, picks });
}

/** The narrator removes a chosen person again. */
export function unchoosePlayer(guide: Guide, name: string): Guide {
  const { selection } = current(guide);
  const { status } = guide.session.present;
  // The people who have to vote yes stay chosen; a nomination is taken back from the chosen person on.
  if (status === "vote" && initialSelection(guide.session.present).picks.includes(name))
    return guide;
  const index = selection.picks.indexOf(name);
  const picks =
    status === "day"
      ? selection.picks.slice(0, Math.max(0, index))
      : selection.picks.filter((pick) => pick !== name);
  return withSelection(guide, { ...selection, picks });
}

export function chooseNobody(guide: Guide): Guide {
  if (!describeGuide(guide).canChooseNobody) return guide;
  return withSelection(guide, { ...current(guide).selection, none: true, picks: [] });
}

/** Takes back the choice of this step (not the step itself). */
export function undoSelection(guide: Guide): Guide {
  const { selection } = current(guide);
  return withSelection(guide, {
    ...initialSelection(guide.session.present),
    ability: selection.ability,
  });
}

function commit(guide: Guide, event: WerewolfEvent): Guide {
  const session = advanceWerewolfSession(guide.session, event);
  return {
    session,
    trail: [...guide.trail, frameOf(session.present, session.past.length)],
  };
}

/** "Continue": the next step; the game moves only here, and only when it accepts the event. */
export function continueGuide(guide: Guide): Guide {
  const frame = current(guide);
  const state = guide.session.present;
  switch (frame.phase) {
    case "intro":
      return {
        ...guide,
        trail: [...guide.trail, { ...frame, event: null, phase: "act", selection: emptySelection }],
      };
    case "outro":
      return frame.event ? commit(guide, frame.event) : guide;
    case "act":
    case "plain": {
      const event = acceptedEvent(state, frame.selection);
      if (!event) return guide;
      const next = transitionWerewolf(state, event);
      // The same role stays awake (the seer looks at a result): the game moves on now. Otherwise the role first falls
      // asleep, and the game moves on with the next "continue".
      if (frame.phase === "act" && roleOf(state) !== "day" && roleOf(next) !== roleOf(state))
        return {
          ...guide,
          trail: [...guide.trail, { ...frame, event, phase: "outro" }],
        };
      const moved = commit(guide, event);
      const last = moved.trail[moved.trail.length - 1]!;
      return frame.phase === "act" && roleOf(next) === roleOf(state)
        ? { ...moved, trail: [...moved.trail.slice(0, -1), { ...last, phase: "act" }] }
        : moved;
    }
  }
}

export type GuideBack =
  | { readonly ok: true; readonly guide: Guide }
  | { readonly ok: false; readonly reason: "atStart" | "confirmationRequired" };

/** "Back": exactly one step; a step that the game already took is undone in the game. */
export function backGuide(guide: Guide, confirmed = false): GuideBack {
  if (guide.trail.length > 1) {
    const trail = guide.trail.slice(0, -1);
    const previous = trail[trail.length - 1]!;
    let session = guide.session;
    while (previous.pastLength < session.past.length) {
      const undone = undoWerewolfSession(session, confirmed);
      if (!undone.ok)
        return { ok: false, reason: undone.reason === "emptyHistory" ? "atStart" : undone.reason };
      session = undone.session;
    }
    return { guide: { session, trail }, ok: true };
  }
  const undone = undoWerewolfSession(guide.session, confirmed);
  if (!undone.ok)
    return { ok: false, reason: undone.reason === "emptyHistory" ? "atStart" : undone.reason };
  const { present } = undone.session;
  // The steps before the reload are not known any more: the step starts again with its content open.
  const frame = frameOf(present, undone.session.past.length);
  return {
    guide: {
      session: undone.session,
      trail: [frame.phase === "intro" ? { ...frame, phase: "act" } : frame],
    },
    ok: true,
  };
}

/** True from the announcement of the morning until the next night begins (sun); false at night (moon). */
export function isDayStep(state: WerewolfState): boolean {
  switch (state.status) {
    case "morning":
    case "day":
    case "vote":
    case "exile":
    case "hunter":
    case "drunkHunter":
    case "finished":
      return true;
    default:
      return false;
  }
}
