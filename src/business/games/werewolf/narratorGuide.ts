import type { DeathCause } from "./eventLog";
import { describeNarratorCard, type CardAbilityId, type NarratorCard } from "./narratorCard";
import {
  describePlayers,
  validTargets,
  votingPlayers,
  type WerewolfTargetAction,
} from "./selectors";
import { describeRoleStep, pickLimitOf } from "./roleStep";
import { advanceWerewolfSession, undoWerewolfSession, type WerewolfSession } from "./session";
import {
  transitionWerewolf,
  voteMaximum,
  voteNeeded,
  voteTieAt,
  voteTotal,
  type WerewolfEvent,
  type WerewolfState,
} from "./stateMachine";

/**
 * The guide of the narrator: which instruction the lower box shows and what the narrator can do.
 *
 * - intro: "the role wakes up"; the narrator taps and the upper box shows the role.
 * - act: the narrator uses an ability (or only confirms); the choice is kept here and reaches the game on "continue".
 * - outro: "the role falls asleep again"; the choice is handed to the game on "continue".
 * - plain: a step without an awake role (the role reveal, the morning, the day).
 * - ready: the roles are dealt and the last player has looked: the device goes back to the narrator, who begins the
 *   game with the button below (it says "begin" here). Nothing of the game is shown, so the last player learns
 *   nothing.
 *
 * Every phase is one step of the trail, so "back" is exactly one step: inside a role, back to the previous role, or
 * back into the day. The game itself only moves on a confirmed event, so going back never replays randomness.
 */
export type GuidePhase = "intro" | "act" | "outro" | "plain" | "ready";

export interface GuideSelection {
  /** The ability whose targets are shown. */
  readonly ability: CardAbilityId | null;
  /** The healing potion or the healing spell is used. */
  readonly heal: boolean;
  readonly picks: readonly string[];
  /** The narrator chose "nobody" where that is allowed. */
  readonly none: boolean;
  /**
   * The witch is asked in two rounds, always both: first whether she saves the victim (heal), then whether she poisons
   * somebody. This is the question that is open now.
   */
  readonly question?: "heal" | "poison";
  /**
   * The magician is asked in two rounds as well: first the healing spell or a death spell ("heal"), then a second
   * death spell ("poison"). The number of people of the first spell, who stay chosen in the second round.
   */
  readonly spellPicks?: number;
  /** The boxes of the script that the narrator has confirmed with a check (Cupid: the sleeping, then the touching). */
  readonly progress?: number;
  /** The day: the summary is announced, the narrator asks everybody to go to sleep (the last box of the script is open). */
  readonly sleeping?: boolean;
  /** At the vote: what each voter chose (voter to candidate). */
  readonly ballots?: Readonly<Record<string, string>>;
  /** At the vote: the votes the narrator entered for each nominated person (candidate to number). */
  readonly counts?: Readonly<Record<string, number>>;
  /** At the vote: the nominated person who gets the second vote of the mayor with the double vote. */
  readonly bonus?: string;
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
  /** The narrator came back to this step from the next role: from here the way back stops (one role at most). */
  readonly returned?: boolean;
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
function phaseOf(state: WerewolfState): GuidePhase {
  const card = describeNarratorCard(state);
  // Nobody wakes up during the day: its card is open at once. The hunter acts in public (everybody is awake and sees
  // it): his card is open at once as well.
  return !card ? "plain" : card.role === "day" || card.role === "hunter" ? "act" : "intro";
}

/** The vote opens at once; nobody has chosen yet. */
function initialSelection(state: WerewolfState): GuideSelection {
  if (state.status === "witch" || state.status === "magician")
    return { ...emptySelection, question: "heal" };
  return state.status === "vote" ? { ...emptySelection, ability: "vote" } : emptySelection;
}

function frameOf(state: WerewolfState, pastLength: number): GuideFrame {
  return { event: null, pastLength, phase: phaseOf(state), selection: initialSelection(state) };
}

/** True right after the last player has looked at the role: the game is dealt but not begun. */
function justDealt(session: WerewolfSession): boolean {
  const last = session.past[session.past.length - 1];
  return last?.status === "roles" && session.present.status !== "roles";
}

const guidePhases: readonly unknown[] = ["intro", "act", "outro", "plain", "ready"];
const maxSavedTrail = 2000;

function isSavedFrame(value: unknown): value is GuideFrame {
  if (typeof value !== "object" || value === null) return false;
  const frame = value as Partial<GuideFrame>;
  const selection = frame.selection as Partial<GuideSelection> | undefined;
  return (
    guidePhases.includes(frame.phase) &&
    Number.isInteger(frame.pastLength) &&
    (frame.event === null || (typeof frame.event === "object" && frame.event !== undefined)) &&
    typeof selection === "object" &&
    selection !== null &&
    (selection.ability === null || typeof selection.ability === "string") &&
    typeof selection.heal === "boolean" &&
    typeof selection.none === "boolean" &&
    Array.isArray(selection.picks) &&
    selection.picks.every((pick) => typeof pick === "string")
  );
}

/**
 * Reads the saved trail of the guide (the checkpoints of the narrator: every step with its choice). It is only taken
 * when it belongs to the saved game, that is when its last step is the present of the game; otherwise undefined.
 */
export function parseSavedTrail(
  raw: unknown,
  session: WerewolfSession,
): readonly GuideFrame[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > maxSavedTrail) return undefined;
  if (!raw.every(isSavedFrame)) return undefined;
  const last = raw[raw.length - 1]!;
  return last.pastLength === session.past.length ? raw : undefined;
}

/** Starts the guide; a saved trail brings back the steps and the choices made before a reload. */
export function createGuide(session: WerewolfSession, savedTrail?: unknown): Guide {
  const trail = parseSavedTrail(savedTrail, session);
  if (trail) return { session, trail };
  const frame = frameOf(session.present, session.past.length);
  return {
    session,
    trail: [justDealt(session) ? { ...frame, phase: "ready", selection: emptySelection } : frame],
  };
}

function current(guide: Guide): GuideFrame {
  return guide.trail[guide.trail.length - 1]!;
}

/** The event that the choice of the narrator stands for, or null while something is missing. */
function eventOf(state: WerewolfState, selection: GuideSelection): WerewolfEvent | null {
  const { night } = state;
  const first = selection.picks[0];
  const target = first ?? null;
  // A step that names one person: the description says what it hands to the game (see roleStep.ts).
  const step = describeRoleStep(state);
  if (step.pick) {
    const { event, nobody, skipTarget } = step.pick;
    if (first !== undefined) return { night, target: first, type: event };
    if (nobody && selection.none) return { night, target: null, type: event } as WerewolfEvent;
    // The button "skip" (a role that may do nothing, the holder who keeps the amulet): the step is complete.
    if (step.skippable && selection.ability === null)
      return { night, target: skipTarget, type: event } as WerewolfEvent;
    return null;
  }
  switch (step.compound) {
    case "potions":
      // The witch has to answer the first question (heal or not) before the step can be confirmed.
      if (selection.question === "heal") return null;
      return { heal: selection.heal, night, poison: target, type: "potions" };
    case "castSpells":
      // The magician has to answer the first question before the step can be confirmed (an open list of people is
      // closed with the check mark first).
      if (selection.question === "heal" && selection.ability === null) return null;
      return { heal: selection.heal, kill: selection.picks, night, type: "castSpells" };
    case "bond": {
      const [one, two] = selection.picks;
      return one && two ? { night, players: [one, two], type: "bond" } : null;
    }
    case "nominate":
      // Nobody named and no vote open: the day ends, but only once the narrator has chosen "no vote" (the option above).
      // One to three named people: the vote.
      if (selection.picks.length === 0)
        // The day ends only after the script: the summary is announced and everybody was asked to go to sleep (the check).
        return selection.ability === null &&
          selection.sleeping === true &&
          ((selection.progress ?? 0) >= 1 || votedToday(state))
          ? { night, type: "endDay" }
          : null;
      return { night, nominees: selection.picks, type: "nominate" };
    case "vote":
      if (state.status !== "vote") return null;
      // One ballot per voter (the old way) or the votes counted per candidate (the narrator enters numbers).
      if (Object.keys(ballotsOf(selection)).length > 0)
        return { ballots: ballotsOf(selection), night, nomination: state.nomination, type: "vote" };
      return {
        counts: Object.fromEntries(
          state.candidates.map((name) => [
            name,
            (selection.counts?.[name] ?? 0) + (selection.bonus === name ? 1 : 0),
          ]),
        ),
        night,
        nomination: state.nomination,
        type: "voteCount",
      };
    default:
      break;
  }
  // A step that the narrator only confirms. The drunk: first the true role has to be shown to him (the window is closed).
  if (step.confirm) {
    if (state.status === "drunkReveal" && (selection.progress ?? 0) < 1) return null;
    return { night, type: step.confirm };
  }
  if (state.status === "roles") {
    const player = state.players[state.index];
    return player ? { player: player.name, type: "roleSeen" } : null;
  }
  return null;
}

/** The event only counts when the game accepts it. */
/** True in the day after a vote (whoever left the game or not): the nomination is over, only the end of the day is left. */
function votedToday(state: WerewolfState): boolean {
  return (
    state.status === "day" &&
    state.history.some(
      (entry) =>
        entry.kind === "action" &&
        entry.night === state.night &&
        (entry.event.type === "vote" || entry.event.type === "voteCount"),
    )
  );
}

function acceptedEvent(state: WerewolfState, selection: GuideSelection): WerewolfEvent | null {
  const event = eventOf(state, selection);
  return event && transitionWerewolf(state, event) !== state ? event : null;
}

function roleOf(state: WerewolfState) {
  return describeNarratorCard(state)?.role ?? null;
}

/** A person who leaves the game and the reasons, for the narrator only. */
export interface DeathNote {
  readonly name: string;
  readonly causes: readonly DeathCause[];
}

export interface GuideNotes {
  readonly silenced: string | null;
  /** The tanner who wins only by being voted out (the setting "vote only"): the narrator keeps him in mind during the day. */
  readonly tanner: string | null;
  readonly wounded: readonly string[];
  /** The person the open choice may not name again (the bodyguard and the night guest need a new one every night). */
  readonly restricted: string | null;
}

/** What a confirmed event would let leave the game, read from the log of a trial transition. */
function previewDeaths(state: WerewolfState, event: WerewolfEvent | null): readonly DeathNote[] {
  if (!event) return [];
  const next = transitionWerewolf(state, event);
  if (next === state) return [];
  return next.history.slice(state.history.length).flatMap((entry) =>
    entry.kind === "death"
      ? [
          {
            causes: [...new Set(entry.sources.map((source) => source.cause))],
            name: entry.player,
          },
        ]
      : [],
  );
}

export interface BallotRow {
  readonly name: string;
  /** The candidates he can vote for (never himself). */
  readonly choices: readonly string[];
  /** The mayor with the double vote counts twice. */
  readonly weight: number;
  /** The narrator sets this vote himself (the village idiot). */
  readonly setByNarrator: boolean;
  readonly choice: string | null;
}

export interface GuideView {
  /** What the "next" button says: the day ends, the vote starts or ends, the game is left, or simply "next". */
  readonly nextKind: "begin" | "endDay" | "finish" | "next";
  /** Who leaves the game through the step that is about to be confirmed, and why (private to the narrator). */
  readonly deaths: readonly DeathNote[];
  /** Facts the narrator has to keep in mind during the day (silenced, wounded) and who a choice may not name. */
  readonly notes: GuideNotes;
  /** The votes that do not count once: the mayor twice, the village idiot has to vote yes. */
  /** The day after a vote: who left the game in this day (the summary of the day says so). */
  readonly exiledToday: readonly string[];
  /** The day after a vote (whoever left or not): the nomination is over, only the end of the day is left. */
  readonly votedToday: boolean;
  /** The day: the last box of the script (everybody goes to sleep) is the open one; the next step starts the night. */
  readonly sleeping: boolean;
  readonly voterNotes: Readonly<Record<string, "double" | "setByNarrator">>;
  /** At the vote: one row for every voter with the choices, the weight and what was chosen so far. */
  readonly ballotRows: readonly BallotRow[];
  /** At the vote: the votes entered for each nominated person, how many votes there are and how many were entered. */
  readonly voteCounts: Readonly<Record<string, number>>;
  readonly voteTotal: number;
  /** At the vote: the most votes each nominated person can get (all votes minus his own). */
  readonly voteMax: Readonly<Record<string, number>>;
  readonly voteSum: number;
  /** One nominated person (yes or no): the yes votes he needs to leave the game; 0 when several are nominated. */
  readonly voteNeeded: number;
  /** One nominated person: the yes votes that make a tie (the vote is held once more); null when there is none. */
  readonly voteTieAt: number | null;
  /**
   * The mayor with the double vote at the vote: his second vote goes to one nominated person (or, with one nominated person,
   * is a yes vote or not). `required` is true when the vote cannot be confirmed before it is assigned. null without.
   */
  readonly voteBonus: {
    readonly chosen: string | null;
    readonly choices: readonly string[];
    readonly mayor: string;
    readonly required: boolean;
  } | null;
  /** The question the witch or the magician is asked now (first or second), or null. */
  readonly question: "heal" | "poison" | null;
  /** How many boxes of the script of Cupid are confirmed (0, 1). */
  readonly progress: number;
  readonly phase: GuidePhase;
  readonly state: WerewolfState;
  /** The role that is awake (also in the outro, where it is falling asleep); null in a plain step. */
  readonly card: NarratorCard | null;
  readonly selection: GuideSelection;
  /** The people the narrator can choose now; empty while no ability is open. */
  readonly targets: readonly string[];
  readonly canChooseNobody: boolean;
  /** The list of people can be closed again (an ability that was opened by a tap). */
  readonly canCloseAbility: boolean;
  readonly canContinue: boolean;
  /**
   * The button "next" at the bottom can be used. It changes from one role to the next (or to the day, the morning, ...),
   * so it waits until a role is asleep again; inside the step of a role the box of the role is operated.
   */
  readonly canNext: boolean;
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
    // At the day the narrator names up to three people; at the vote there is no list of people (the ballots are).
    targets =
      state.status === "vote"
        ? []
        : validTargets(state, "nominate", { selected: selection.picks }).filter(
            (name) => !selection.picks.includes(name),
          );
  } else if (frame.phase === "act" && action)
    targets = validTargets(state, action, {
      heal: selection.heal,
      selected: selection.ability === "bond" ? selection.picks.slice(0, 1) : selection.picks,
    }).filter((name) => !selection.picks.includes(name));
  // Whoever cannot be named (the holder who keeps the amulet with the button "keep") is not in the list.
  const excluded = describeRoleStep(state).pick?.excludes;
  if (excluded !== undefined) targets = targets.filter((name) => name !== excluded);
  // A list of people is open and nobody is chosen: it cannot be confirmed (whoever wants nobody skips the ability).
  const choosingNobody =
    frame.phase === "act" &&
    selection.ability !== null &&
    state.status !== "vote" &&
    selection.picks.length === 0 &&
    !selection.none;
  // The vote with the double vote of the mayor and several nominated people: the second vote has to be assigned first.
  const bonusMissing =
    state.status === "vote" &&
    voteBonusOf(state, selection)?.required === true &&
    selection.bonus === undefined &&
    // (Named votes of the old kind have no second vote to assign.)
    Object.keys(selection.ballots ?? {}).length === 0;
  const canContinue =
    !choosingNobody &&
    !bonusMissing &&
    (frame.phase === "ready" ||
      state.status === "finished" ||
      frame.phase === "intro" ||
      frame.phase === "outro" ||
      ((frame.phase === "act" || frame.phase === "plain") &&
        acceptedEvent(state, selection) !== null));
  const dayCard = frame.phase === "act" && describeNarratorCard(state)?.role === "day";
  const canNext =
    frame.phase === "ready" ||
    frame.phase === "outro" ||
    state.status === "finished" ||
    ((frame.phase === "plain" || dayCard) && canContinue);
  return {
    canChooseNobody:
      frame.phase === "act" &&
      selection.ability !== null &&
      describeRoleStep(state).pick?.nobody === true,
    canCloseAbility: frame.phase === "act" && state.status !== "vote" && selection.ability !== null,
    canContinue,
    canNext,
    canGoBack:
      (guide.trail.length > 1 || guide.session.past.length > 0) &&
      (state.status === "vote" || !backIsBlocked(guide)),
    canUndo:
      selection.question === "poison" ||
      (state.status === "day" &&
        selection.ability === null &&
        ((selection.progress ?? 0) >= 1 || votedToday(state))) ||
      selection.picks.length > initialSelection(state).picks.length ||
      selection.heal ||
      selection.none ||
      Object.keys(ballotsOf(selection)).length > 0 ||
      Object.values(selection.counts ?? {}).some((count) => count > 0) ||
      selection.bonus !== undefined,
    card: frame.phase === "ready" ? null : describeNarratorCard(state),
    deaths:
      state.status === "morning" || state.status === "exile"
        ? previewDeaths(state, eventOf(state, emptySelection))
        : frame.phase === "outro" && describeNarratorCard(state)?.role === "hunter"
          ? previewDeaths(state, frame.event)
          : [],
    notes: {
      restricted:
        frame.phase === "act" && selection.ability === "protect"
          ? state.protectedPlayer
          : frame.phase === "act" && selection.ability === "stayWith"
            ? state.hostPlayer
            : null,
      silenced:
        state.silencedPlayer && state.alive.some((p) => p.name === state.silencedPlayer)
          ? state.silencedPlayer
          : null,
      tanner:
        state.settings.tanner === "voteOnly"
          ? (state.alive.find((player) => player.role === "tanner")?.name ?? null)
          : null,
      wounded: describePlayers(state)
        .filter((player) => player.alive && player.delayedDeathNight !== null)
        .map((player) => player.name),
    },
    ballotRows: ballotRowsOf(state, selection),
    voteCounts:
      state.status === "vote"
        ? Object.fromEntries(state.candidates.map((name) => [name, selection.counts?.[name] ?? 0]))
        : {},
    voteBonus: voteBonusOf(state, selection),
    voteSum:
      Object.values(selection.counts ?? {}).reduce((sum, count) => sum + count, 0) +
      (selection.bonus === undefined ? 0 : 1),
    voteNeeded: voteNeeded(state),
    voteTieAt: voteTieAt(state),
    voteTotal: voteTotal(state),
    voteMax:
      state.status === "vote"
        ? Object.fromEntries(state.candidates.map((name) => [name, voteMaximum(state, name)]))
        : {},
    progress: selection.progress ?? 0,
    question:
      state.status === "witch" || state.status === "magician" ? (selection.question ?? null) : null,
    exiledToday:
      state.status === "day"
        ? state.history
            .filter(
              (entry) =>
                entry.kind === "death" && entry.phase === "exile" && entry.night === state.night,
            )
            .map((entry) => (entry.kind === "death" ? entry.player : ""))
        : [],
    votedToday: votedToday(state),
    sleeping: state.status === "day" && selection.sleeping === true,
    voterNotes: voterNotesOf(state),
    nextKind:
      frame.phase === "ready"
        ? "begin"
        : state.status === "finished"
          ? "finish"
          : // During the day (nomination and vote included) the button is always the one that ends the day.
            state.status === "vote" || state.status === "day"
            ? "endDay"
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
export function chooseAbility(original: Guide, id: CardAbilityId): Guide {
  // The result of the seer is already in the game: looking again takes that step back first, then the choice is open.
  const guide = takeBackVision(original, id);
  const state = guide.session.present;
  // The role is awake until the narrator goes on: after the choice was confirmed ("asleep") an ability can still be
  // tapped to change the choice; the step is open again and the new choice replaces the old one.
  const reopened =
    current(guide).phase === "outro"
      ? {
          ...guide,
          trail: [...guide.trail, { ...current(guide), event: null, phase: "act" as const }],
        }
      : guide;
  const frame = current(reopened);
  if (frame.phase !== "act") return guide;
  const card = describeNarratorCard(state);
  if (!card?.abilities.some((ability) => ability.id === id && ability.available)) return guide;
  const { selection } = frame;
  // The witch is asked in two rounds: the healing potion belongs to the first question, the poison to the second.
  if (state.status === "witch" && selection.question !== undefined) {
    if (id === "heal") {
      if (selection.question !== "heal") return guide;
      const next = { ...selection, heal: true, question: "poison" as const };
      // The game decides whether there is somebody to heal; a choice it would refuse is not taken.
      return acceptedEvent(state, next) ? withSelection(reopened, next) : guide;
    }
    if (selection.question !== "poison") return guide;
  }
  // The magician: the healing spell belongs to the first question, a death spell to either of the two.
  if (state.status === "magician" && selection.question !== undefined && id === "heal") {
    if (selection.question !== "heal") return guide;
    const next = {
      ...selection,
      heal: true,
      question: "poison" as const,
      spellPicks: selection.picks.length,
    };
    return acceptedEvent(state, next) ? withSelection(reopened, next) : guide;
  }
  if (id === "heal") {
    const next = { ...selection, heal: !selection.heal };
    // The game decides whether there is somebody to heal; a choice it would refuse is not taken.
    if (next.heal && eventOf(state, next) && !acceptedEvent(state, next)) return guide;
    return withSelection(reopened, next);
  }
  // The magician casts a spell twice: the people of the first cast stay chosen when the spell is tapped again, and
  // the second cast is added to them (the number of spells left limits the list).
  const compound = describeRoleStep(state).compound;
  const adds =
    (compound === "castSpells" || compound === "potions") &&
    selection.ability === null &&
    selection.picks.length > 0;
  return withSelection(reopened, {
    ...selection,
    ability: id,
    none: false,
    picks: adds ? selection.picks : [],
  });
}

function takeBackVision(guide: Guide, id: CardAbilityId): Guide {
  const frame = current(guide);
  if (id !== "inspect" || guide.session.present.status !== "vision" || frame.phase !== "act")
    return guide;
  const undone = undoWerewolfSession(guide.session);
  if (!undone.ok) return guide;
  return {
    session: undone.session,
    trail: [
      ...guide.trail,
      { ...frame, event: null, pastLength: undone.session.past.length, selection: emptySelection },
    ],
  };
}

/**
 * The narrator takes a decision back (the small reset button in the summary): the step of the role is open again,
 * nothing is chosen, and the abilities can be used again. The game itself only moves on "continue", so nothing is lost.
 */
export function reopenDecision(guide: Guide): Guide {
  const frame = current(guide);
  if (frame.phase !== "outro") return guide;
  const initial = initialSelection(guide.session.present);
  // One decision back per tap: the witch is asked the last question again, her earlier answer stays.
  const magician = guide.session.present.status === "magician";
  const selection =
    frame.selection.question === undefined
      ? initial
      : magician
        ? // The magician starts again with the first question (the victim stays shown).
          { ...initial, progress: 1 }
        : { ...initial, heal: frame.selection.heal, question: "poison" as const };
  return { ...guide, trail: [...guide.trail, { ...frame, event: null, phase: "act", selection }] };
}

/**
 * The check of a box of a script that is not decided by a choice. The witch and the magician: the victim is shown.
 * Cupid's script has three boxes: pointing at the two people, falling asleep, touching the two. The people are chosen in the list; the check of the first box confirms the decision, the check of the second says that Cupid sleeps, the
 * check of the third that the lovers were touched, which finishes the step.
 */
export function checkScript(guide: Guide): Guide {
  const frame = current(guide);
  const state = guide.session.present;
  const { selection } = frame;
  // The witch: the narrator has shown the victim (the check of the first box of her script).
  if (
    frame.phase === "act" &&
    (state.status === "witch" || state.status === "magician") &&
    selection.ability === null
  ) {
    return (selection.progress ?? 0) >= 1 || selection.question !== "heal"
      ? guide
      : withSelection(guide, { ...selection, progress: 1 });
  }
  // The day: the summary is announced (the check of the second box), now the narrator asks everybody to go to sleep.
  if (frame.phase === "act" && state.status === "day") {
    const settled = (selection.progress ?? 0) >= 1 || votedToday(state);
    return selection.ability === null &&
      selection.picks.length === 0 &&
      settled &&
      !selection.sleeping
      ? withSelection(guide, { ...selection, sleeping: true })
      : guide;
  }
  if (frame.phase !== "act" || state.status !== "cupid" || selection.ability !== null) return guide;
  if (selection.picks.length < 2) return guide;
  const progress = selection.progress ?? 0;
  // 0 -> 1: the choice of the two is confirmed; 1 -> 2: Cupid sleeps; the last check (the lovers are touched) finishes the step.
  if (progress < 2) return withSelection(guide, { ...selection, progress: progress + 1 });
  return continueGuide(withSelection(guide, { ...selection, progress: 3 }));
}

/**
 * The drunk: the true role was shown to him (the window with the card was closed), so the check of the step can be used.
 * It is taken back with the undo button of the box (the role can be shown once more).
 */
export function markRoleShown(guide: Guide): Guide {
  const frame = current(guide);
  if (frame.phase !== "act" || guide.session.present.status !== "drunkReveal") return guide;
  return (frame.selection.progress ?? 0) >= 1
    ? guide
    : withSelection(guide, { ...frame.selection, progress: 1 });
}

/**
 * "No vote" at the day: nobody is nominated, the day can be ended with "next". It is the choice of the box of the
 * script and can be taken back with its undo button (the reset).
 */
export function chooseNoVote(guide: Guide): Guide {
  const frame = current(guide);
  const { selection } = frame;
  if (
    frame.phase !== "act" ||
    guide.session.present.status !== "day" ||
    selection.ability !== null ||
    selection.picks.length > 0
  )
    return guide;
  return withSelection(guide, { ...selection, progress: 1 });
}

/**
 * The witch takes one of her two questions back (the undo button right of its box in the script): the question is asked
 * again, the answers after it are gone, the answers before it stay. It works while the step is open and after it was
 * confirmed (the role is asleep again).
 */
export function undoQuestion(guide: Guide, question: "heal" | "poison"): Guide {
  const frame = current(guide);
  const state = guide.session.present;
  if (
    (state.status !== "witch" && state.status !== "magician") ||
    frame.selection.question === undefined
  )
    return guide;
  const initial = initialSelection(state);
  const selection =
    // The victim was shown already: a question that is asked again does not take the first box back.
    question === "heal"
      ? { ...initial, progress: 1 }
      : {
          ...initial,
          heal: frame.selection.heal,
          picks: frame.selection.picks.slice(0, frame.selection.spellPicks ?? 0),
          progress: 1,
          question: "poison" as const,
          ...(frame.selection.spellPicks === undefined
            ? {}
            : { spellPicks: frame.selection.spellPicks }),
        };
  if (frame.phase === "outro")
    return {
      ...guide,
      trail: [...guide.trail, { ...frame, event: null, phase: "act", selection }],
    };
  return frame.phase === "act" ? withSelection(guide, selection) : guide;
}

/**
 * The witch is always asked both questions: "save the victim?" and then "poison somebody?". "Use" saves the victim in the
 * first round and opens the list of people in the second; "skip" says no in either round (after the second one the step is
 * complete and goes to "asleep"). An ability that cannot be used (no victim, no potion left) is still asked: the narrator
 * answers it with "skip".
 */
export function answerQuestion(guide: Guide, answer: "skip" | "use"): Guide {
  const frame = current(guide);
  const state = guide.session.present;
  const question = frame.selection.question;
  const magician = state.status === "magician";
  if (frame.phase !== "act" || (state.status !== "witch" && !magician) || question === undefined)
    return guide;
  if (question === "heal") {
    if (answer === "use") return chooseAbility(guide, "heal");
    return withSelection(guide, {
      ...frame.selection,
      heal: false,
      question: "poison",
      ...(magician ? { spellPicks: frame.selection.picks.length } : {}),
    });
  }
  return answer === "use"
    ? chooseAbility(guide, magician ? "kill" : "poison")
    : continueGuide(guide);
}

/** The narrator closes the list of people again (an ability was tapped by mistake); the choices of it are dropped. */
export function closeAbility(guide: Guide): Guide {
  const frame = current(guide);
  const state = guide.session.present;
  // The vote is the whole step of its own: there is nothing to close.
  if (frame.phase !== "act" || state.status === "vote" || frame.selection.ability === null)
    return guide;
  return withSelection(guide, { ...frame.selection, ability: null, none: false, picks: [] });
}

/** The narrator taps a person in the list. */
export function choosePlayer(guide: Guide, name: string): Guide {
  const view = describeGuide(guide);
  if (!view.targets.includes(name)) return guide;
  const { selection } = view;
  // The magician names one person per spell: the first question takes one, the second one more.
  const limit =
    view.state.status === "magician" && selection.question !== undefined
      ? (selection.spellPicks ?? 0) + 1
      : pickLimitOf(view.state, selection.ability, selection.heal);
  const picks = limit === 1 ? [name] : [...selection.picks, name].slice(0, limit);
  return withSelection(guide, { ...selection, none: false, picks });
}

/** The narrator removes a chosen person again. */
export function unchoosePlayer(guide: Guide, name: string): Guide {
  const { selection } = current(guide);
  // The person of the first spell stays chosen while the second one is chosen (undo takes that back).
  if (
    selection.question === "poison" &&
    selection.picks.indexOf(name) < (selection.spellPicks ?? 0)
  )
    return guide;
  return withSelection(guide, {
    ...selection,
    picks: selection.picks.filter((pick) => pick !== name),
  });
}

/**
 * At the vote: the narrator sets what one voter chose. Tapping the same choice again takes it back. A voter can only
 * choose among the candidates and never himself.
 */
export function setBallot(guide: Guide, voter: string, candidate: string): Guide {
  const frame = current(guide);
  const row = describeGuide(guide).ballotRows.find((entry) => entry.name === voter);
  if (frame.phase !== "act" || !row?.choices.includes(candidate)) return guide;
  const ballots = { ...ballotsOf(frame.selection) };
  if (ballots[voter] === candidate) delete ballots[voter];
  else ballots[voter] = candidate;
  return withSelection(guide, { ...frame.selection, ballots });
}

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
function voteBonusOf(state: WerewolfState, selection: GuideSelection): GuideView["voteBonus"] {
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

export function chooseNobody(guide: Guide): Guide {
  if (!describeGuide(guide).canChooseNobody) return guide;
  return withSelection(guide, { ...current(guide).selection, none: true, picks: [] });
}

/**
 * The day after a vote: takes the vote back (the nomination, the counted votes, whoever left the game) and lands at the
 * first box of the script of the day, where nobody is nominated yet.
 */
function undoDayVote(guide: Guide): Guide {
  let session = guide.session;
  for (let guard = 0; guard < 20; guard += 1) {
    const undone = undoWerewolfSession(session, true);
    if (!undone.ok) return guide;
    session = undone.session;
    if (session.present.status === "day" && !votedToday(session.present)) break;
  }
  const frame = frameOf(session.present, session.past.length);
  return {
    session,
    trail: [...guide.trail.filter((entry) => entry.pastLength < session.past.length), frame],
  };
}

/** Takes back the choice of this step (not the step itself). */
export function undoSelection(guide: Guide): Guide {
  const { selection } = current(guide);
  const initial = initialSelection(guide.session.present);
  // The day after a vote: the undo button of the first box leads back to it (the vote is taken back).
  if (votedToday(guide.session.present)) return undoDayVote(guide);
  // The witch is asked question by question: one decision back per tap (the people of the poison, then the open list,
  // then the second question back to the first one).
  if (selection.question !== undefined) {
    if (selection.ability !== null)
      return withSelection(
        guide,
        selection.picks.length > (selection.spellPicks ?? 0)
          ? {
              ...selection,
              none: false,
              picks: selection.picks.slice(0, selection.spellPicks ?? 0),
            }
          : { ...selection, ability: null, none: false },
      );
    return withSelection(guide, initial);
  }
  return withSelection(guide, { ...initial, ability: selection.ability });
}

function commit(guide: Guide, event: WerewolfEvent): Guide {
  let session = advanceWerewolfSession(guide.session, event);
  // The result of a vote is announced at once: the narrator comes back to the script of the day, where the blue box
  // sums up who left the game (there is no view of its own for it).
  if (session.present.status === "exile")
    session = advanceWerewolfSession(session, {
      type: "announceExile",
      night: session.present.night,
    });
  const frame = frameOf(session.present, session.past.length);
  return {
    session,
    // The last player of the role reveal hands the device back: the game waits for the narrator.
    trail: [
      ...guide.trail,
      justDealt(session) ? { ...frame, phase: "ready", selection: emptySelection } : frame,
    ],
  };
}

/** "Continue": the next step; the game moves only here, and only when it accepts the event. */
export function continueGuide(guide: Guide): Guide {
  const frame = current(guide);
  const state = guide.session.present;
  switch (frame.phase) {
    case "ready":
      // The narrator begins the game: the first step of the night.
      return {
        ...guide,
        trail: [...guide.trail, frameOf(state, guide.session.past.length)],
      };
    case "intro":
      return {
        ...guide,
        trail: [
          ...guide.trail,
          { ...frame, event: null, phase: "act", selection: initialSelection(state) },
        ],
      };
    case "outro":
      return frame.event ? commit(guide, frame.event) : guide;
    case "act":
    case "plain": {
      // The magician and Cupid choose in parts: the check mark of an open choice only closes it, the choice stays; the
      // step itself is confirmed later (the magician with "done", Cupid with the checks of the script).
      const compound = describeRoleStep(state).compound;
      // An open list of people is not confirmed without a choice.
      if (
        frame.phase === "act" &&
        frame.selection.ability !== null &&
        state.status !== "vote" &&
        frame.selection.picks.length === 0 &&
        !frame.selection.none
      )
        return guide;
      // The list of the second round of the magician finishes the step instead.
      if (
        frame.phase === "act" &&
        (compound === "bond" ||
          (compound === "castSpells" && frame.selection.question !== "poison")) &&
        frame.selection.ability !== null &&
        frame.selection.ability !== "heal"
      )
        return {
          ...guide,
          trail: [
            ...guide.trail,
            {
              ...frame,
              selection: {
                ...frame.selection,
                ability: null,
                // The first spell is done: the second question follows.
                ...(compound === "castSpells"
                  ? { question: "poison" as const, spellPicks: frame.selection.picks.length }
                  : // Cupid: the check mark of the list confirms the choice of the two (the next box of the script follows).
                    { progress: Math.max(1, frame.selection.progress ?? 0) }),
              },
            },
          ],
        };
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
  | { readonly ok: false; readonly reason: "atStart" | "confirmationRequired" | "limit" };

/** Where the step of the current role starts in the trail: announcement, choice and falling asleep belong together. */
function roleStart(guide: Guide): number {
  const length = guide.session.past.length;
  let start = guide.trail.length - 1;
  while (
    start > 1 &&
    guide.trail[start]!.phase !== "ready" &&
    guide.trail[start - 1]!.pastLength === length &&
    guide.trail[start - 1]!.phase !== "ready"
  )
    start -= 1;
  return start;
}

/**
 * Back may leave the step of a role (go to the previous role) only once: after coming back to a role the narrator
 * decides again (or goes forward); further back is not possible until the game has moved on and the narrator comes
 * back from the next role. Inside one role (announcement, choice, falling asleep) back is always possible.
 */
function backIsBlocked(guide: Guide): boolean {
  // The role reveal has nothing to do with the game: back and forward are free until the narrator begins the game.
  if (guide.session.present.status === "roles" || current(guide).phase === "ready") return false;
  const length = guide.session.past.length;
  const previous = guide.trail[roleStart(guide) - 1];
  const leavesRole = previous ? previous.pastLength < length : length > 0;
  return (
    leavesRole &&
    guide.trail.some((frame) => frame.returned === true && frame.pastLength === length)
  );
}

/** "Back": to the previous role (a step that the game already took is undone in the game), but only one role back. */
export function backGuide(guide: Guide, confirmed = false): GuideBack {
  // The vote can always be broken off: back to the nomination, however often the narrator has come back to it.
  if (guide.session.present.status !== "vote" && backIsBlocked(guide))
    return { ok: false, reason: "limit" };
  if (guide.trail.length > 1) {
    // Back leaves the whole step of the current role (announcement, choice, falling asleep) at once: it only moves
    // between the roles. A decision is taken back with the button in the summary (see `reopenDecision`).
    const start = roleStart(guide);
    const trail = guide.trail.slice(0, start);
    const previous = trail[trail.length - 1]!;
    let session = guide.session;
    while (previous.pastLength < session.past.length) {
      const undone = undoWerewolfSession(session, confirmed);
      if (!undone.ok)
        return { ok: false, reason: undone.reason === "emptyHistory" ? "atStart" : undone.reason };
      session = undone.session;
    }
    // Coming back into the role reveal is not marked: there the way back has no limit.
    const crossed = session !== guide.session && session.present.status !== "roles";
    return {
      guide: {
        session,
        // All steps of the role are marked, so the mark stays while the narrator goes back inside the role.
        trail: crossed
          ? trail.map((frame) =>
              frame.pastLength === previous.pastLength ? { ...frame, returned: true } : frame,
            )
          : trail,
      },
      ok: true,
    };
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
      trail: [
        {
          ...(frame.phase === "intro" ? { ...frame, phase: "act" as const } : frame),
          returned: true,
        },
      ],
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

function ballotsOf(selection: GuideSelection): Readonly<Record<string, string>> {
  return selection.ballots ?? {};
}

function ballotRowsOf(state: WerewolfState, selection: GuideSelection): readonly BallotRow[] {
  const ballots = ballotsOf(selection);
  return votingPlayers(state).map((player) => ({
    choice: ballots[player.name] ?? null,
    choices: player.choices,
    name: player.name,
    setByNarrator: player.setByNarrator,
    weight: player.weight,
  }));
}

function voterNotesOf(state: WerewolfState): Record<string, "double" | "setByNarrator"> {
  const notes: Record<string, "double" | "setByNarrator"> = {};
  for (const player of votingPlayers(state)) {
    if (player.setByNarrator) notes[player.name] = "setByNarrator";
    else if (player.weight === 2) notes[player.name] = "double";
  }
  return notes;
}
