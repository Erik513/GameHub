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
 *
 * The files of the guide: guideTypes.ts (the types), guideFrames.ts (the current step), guideTrail.ts (the saved
 * trail), guideVote.ts (the count of a vote), guideBack.ts ("back") and guideWinners.ts (the winners); this file holds
 * the view and the operations. Names of the operations: choose* and set* put a choice in, undo*, unchoose* and reopen*
 * take one back, continueGuide and backGuide move between the steps, describe* only read.
 */
import { backIsBlocked } from "./guideBack";
import {
  current,
  frameOf,
  initialSelection,
  justDealt,
  potionRoleOf,
  withSelection,
} from "./guideFrames";
import { parseSavedTrail } from "./guideTrail";
import {
  emptySelection,
  type DeathNote,
  type Guide,
  type GuideSelection,
  type GuideView,
} from "./guideTypes";
import { voteBonusOf, voterNotesOf } from "./guideVote";
import { describeNarratorCard, type CardAbilityId } from "./narratorCard";
import { describeRoleStep, pickLimitOf } from "./roleStep";
import { describePlayers, validTargets, type WerewolfTargetAction } from "./selectors";
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
      // The narrator enters the votes counted per candidate.
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
/** The people the investigator looked at: the chosen one and the neighbours left and right among the living. */
function investigatedOf(state: WerewolfState): readonly { name: string; wolf: boolean }[] {
  if (state.status !== "investigation") return [];
  const { alive } = state;
  const seat = alive.findIndex((player) => player.name === state.target);
  if (seat === -1) return [];
  return [-1, 0, 1].map((offset) => {
    const player = alive[(seat + offset + alive.length) % alive.length]!;
    return { name: player.name, wolf: player.role === "wolf" };
  });
}

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

function previewDeaths(state: WerewolfState, event: WerewolfEvent | null): readonly DeathNote[] {
  if (!event) return [];
  const next = transitionWerewolf(state, event);
  if (next === state) return [];
  return next.history.slice(state.history.length).flatMap((entry) =>
    entry.kind === "death"
      ? [
          {
            amuletLost:
              state.amulet?.holder === entry.player && next.amulet?.holder !== entry.player,
            causes: [...new Set(entry.sources.map((source) => source.cause))],
            masked: state.drunk?.player === entry.player && !state.drunk.revealed,
            name: entry.player,
            role: entry.role,
          },
        ]
      : [],
  );
}

export function describeGuide(guide: Guide): GuideView {
  const frame = current(guide);
  const state = guide.session.present;
  const { selection } = frame;
  const potionRole = potionRoleOf(state);
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
    selection.bonus === undefined;
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
      hiddenWolf:
        state.drunk && !state.drunk.revealed
          ? (state.alive.find(
              (player) => player.name === state.drunk?.player && player.role === "wolf",
            )?.name ?? null)
          : null,
      tanner:
        state.settings.tanner === "voteOnly"
          ? (state.alive.find((player) => player.role === "tanner")?.name ?? null)
          : null,
      wounded: describePlayers(state)
        .filter((player) => player.alive && player.delayedDeathNight !== null)
        .map((player) => player.name),
    },
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
    bondDone: state.status === "cupid" && (selection.progress ?? 0) >= 1,
    progress: selection.progress ?? 0,
    shooter: state.status === "hunter" || state.status === "drunkHunter" ? state.hunter.name : null,
    potionRole,
    spellsUsed:
      potionRole === "magician"
        ? Number(selection.heal) +
          // Confirmed death spells: all picks once the list is closed or the step is done, otherwise those of the first round.
          (selection.ability === null || frame.phase === "outro"
            ? selection.picks.length
            : (selection.spellPicks ?? 0))
        : 0,
    question: potionRole ? (selection.question ?? null) : null,
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
    investigated: investigatedOf(state),
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

function isResultStep(state: WerewolfState): boolean {
  return state.status === "vision" || state.status === "investigation";
}

function takeBackVision(guide: Guide, id: CardAbilityId): Guide {
  const frame = current(guide);
  if (id !== "inspect" || guide.session.present.status !== "vision" || frame.phase !== "act")
    return guide;
  return takeBackResult(guide);
}

/**
 * The result of the seer or the investigator is already in the game: the undo button of the decision box takes that step
 * back, so the narrator is at the choice again and can show the role another person (the investigator can use the
 * ability again, because it is not used up any more).
 */
function takeBackResult(guide: Guide): Guide {
  const frame = current(guide);
  if (guide.session.present.status !== "vision" && guide.session.present.status !== "investigation")
    return guide;
  const undone = undoWerewolfSession(guide.session);
  if (!undone.ok) return guide;
  return {
    session: undone.session,
    trail: [
      ...guide.trail,
      {
        ...frame,
        event: null,
        pastLength: undone.session.past.length,
        phase: "act" as const,
        selection: emptySelection,
      },
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
  // The result of the seer or the investigator: one tap goes back to the choice (the step with the result is taken back).
  if (isResultStep(guide.session.present)) return takeBackResult(guide);
  const initial = initialSelection(guide.session.present);
  // One decision back per tap: the witch is asked the last question again, her earlier answer stays.
  const magician = potionRoleOf(guide.session.present) === "magician";
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
  if (frame.phase === "act" && potionRoleOf(state) !== null && selection.ability === null) {
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
  if (potionRoleOf(state) === null || frame.selection.question === undefined) return guide;
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
  const potion = potionRoleOf(state);
  const magician = potion === "magician";
  if (frame.phase !== "act" || potion === null || question === undefined) return guide;
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
    view.potionRole === "magician" && selection.question !== undefined
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
  // The result of the seer or the investigator: back to the choice.
  if (isResultStep(guide.session.present)) return takeBackResult(guide);
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

export * from "./guideTypes";
export { parseSavedTrail } from "./guideTrail";
export { describeWinners, type WinnerGroup } from "./guideWinners";
export { backGuide } from "./guideBack";
export { setVoteBonus, setVoteCount } from "./guideVote";
