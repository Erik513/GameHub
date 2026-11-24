import type { DeathCause } from "./eventLog";
import type { CardAbilityId, NarratorCard } from "./narratorCard";
import type { WerewolfSession } from "./session";
import type { WerewolfEvent, WerewolfState } from "./stateMachine";

/** The types of the guide of the narrator (see narratorGuide.ts for what the guide does). */

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

/** A person who leaves the game and the reasons, for the narrator only. */
export interface DeathNote {
  readonly name: string;
  /** The role of the person (the narrator sees it when he taps the person). */
  readonly role: string;
  /** The person was still the drunk (the true role was not shown yet): the others know him as the drunk. */
  readonly masked: boolean;
  /** The person holds the amulet and loses it with the death. */
  readonly amuletLost: boolean;
  readonly causes: readonly DeathCause[];
}

export interface GuideNotes {
  readonly silenced: string | null;
  /** The tanner who wins only by being voted out (the setting "vote only"): the narrator keeps him in mind during the day. */
  readonly tanner: string | null;
  /** The werewolf who is still the drunk: he is not woken with the werewolves yet (the narrator sees why one name is missing). */
  readonly hiddenWolf: string | null;
  readonly wounded: readonly string[];
  /** The person the open choice may not name again (the bodyguard and the night guest need a new one every night). */
  readonly restricted: string | null;
}

/** What a confirmed event would let leave the game, read from the log of a trial transition. */

export interface GuideView {
  /** What the "next" button says: the day ends, the vote starts or ends, the game is left, or simply "next". */
  /** The role of the step that works with two questions (potions or spells); null at every other step. */
  readonly potionRole: "witch" | "magician" | null;
  /** The name of the hunter (also the drunk who is the hunter) who shoots at this step; null at every other step. */
  readonly shooter: string | null;
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
  /**
   * The investigator after the check: the three people he looked at (the chosen one and his two neighbours among the
   * living) and whether each is a werewolf: extra information for the narrator. Empty at every other step.
   */
  readonly investigated: readonly { readonly name: string; readonly wolf: boolean }[];
  readonly voterNotes: Readonly<Record<string, "double" | "setByNarrator">>;
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
  /** Cupid: the lovers are chosen and the narrator has checked the script, so the choice cannot be changed any more. */
  readonly bondDone: boolean;
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

export type GuideBack =
  | { readonly ok: true; readonly guide: Guide }
  | { readonly ok: false; readonly reason: "atStart" | "confirmationRequired" | "limit" };
