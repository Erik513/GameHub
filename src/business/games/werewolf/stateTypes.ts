import type { WerewolfSettings } from "./configuration";
import type { WerewolfLogEntry } from "./eventLog";
import type { NightRole } from "./nightScript";
import type { GameRoleId } from "./roles/roleIds";
import type {} from "./wounds";

/** The types of the state machine of the werewolf game: the state and the events (see stateMachine.ts). */

/** The role of a person in the game (from the list roles/roleIds.ts). */
export type Role = GameRoleId;
export type VisibleRole = Role | "drunk";
export type Side = "village" | "wolves";
export type Lovers = readonly [string, string];

export interface Player {
  readonly name: string;
  readonly role: Role;
}
export interface Inspection {
  readonly by: string;
  readonly kind: "seer" | "investigator";
  readonly target: string;
}
export interface Amulet {
  readonly holder: string;
  readonly mustPass: boolean;
}
export interface Match {
  readonly history: readonly WerewolfLogEntry[];
  readonly hammerVictim: string | null;
  readonly narrator: string;
  readonly players: readonly Player[];
  readonly alive: readonly Player[];
  readonly night: number;
  readonly protectedPlayer: string | null;
  /**
   * The night of the choice of the bodyguard, the night guest and the spellcaster. The game keeps the person of the last
   * choice for the rule "never the same person twice in a row"; the overview shows the state only in the night (and,
   * for the silence, the day) of the choice, so it is gone when the next night begins.
   */
  readonly protectedNight: number | null;
  readonly hostNight: number | null;
  readonly silencedNight: number | null;
  /**
   * The person the werewolves attacked this night, as the witch and the magician see them: also when the attack
   * did not kill (the amulet or the bodyguard stopped it). They always see the attacked person, so nobody learns
   * from what they see whether a protection was at work.
   */
  readonly wolfTarget: Player | null;
  /**
   * The person the werewolves chose this night, also when somebody else takes the attack (the night guest dies for his
   * host): the overview marks the host as saved.
   */
  readonly wolfChoice: string | null;
  readonly hostPlayer: string | null;
  /**
   * Whom the seer looked at and which people the investigator examined, with the person who did it. A mark stays until
   * that person leaves the game (the apprentice who takes over starts anew), so the overview shows it as long as it
   * helps the one who knows.
   */
  readonly inspections: readonly Inspection[];
  /** The person the wolves attacked and the witch (or the magician) healed this night; it stays until the next night starts. */
  readonly healedPlayer: string | null;
  /** The person the wolves attacked and the magician saved with the healing spell this night; it stays until the next night starts. */
  readonly spellHealedPlayer: string | null;
  readonly potions: { readonly heal: boolean; readonly poison: boolean };
  readonly spellsRemaining: number;
  readonly spellVictims: readonly Player[];
  readonly settings: WerewolfSettings;
  readonly lovers: Lovers | null;
  readonly silencedPlayer: string | null;
  readonly hammerUsed: boolean;
  readonly nightDeaths: readonly Player[];
  readonly shotDeaths?: readonly Player[];
  readonly toughGuyDiesOn: number | null;
  readonly toughGuyWound: {
    readonly cause: "wolves" | "witchPoison" | "magicianKill" | "hunter";
    readonly actors: readonly string[];
    readonly night: number;
  } | null;
  readonly investigationUsed: boolean;
  readonly drunk: { readonly player: string; readonly revealed: boolean } | null;
  readonly tannerWinner: string | null;
  readonly amulet: Amulet | null;
}

export interface HunterTurn {
  readonly hunter: Player;
  readonly next: "day" | "wolves";
  /** The hunter was voted out in the day: his shot belongs to the day (the day goes on after it). */
  readonly inDay?: boolean;
}

export type WerewolfState = Match &
  (
    | { readonly status: "roles"; readonly index: number }
    | { readonly status: "nightCall"; readonly call: NightRole; readonly resume: WerewolfState }
    | {
        readonly status: "amuletPass";
        readonly amulet: Amulet;
        readonly victim: Player | null;
        readonly poisoned: Player | null;
      }
    | { readonly status: "cupid" }
    | { readonly status: "lovers"; readonly lovers: Lovers }
    | { readonly status: "drunkReveal" }
    | { readonly status: "mayor"; readonly victim: Player | null; readonly poisoned: Player | null }
    | { readonly status: "bodyguard" | "nightGuest" }
    | { readonly status: "wolves" }
    | { readonly status: "seer"; readonly victim: Player | null }
    | {
        readonly status: "vision";
        readonly victim: Player | null;
        readonly target: string;
        readonly isWolf: boolean;
      }
    | { readonly status: "investigator"; readonly victim: Player | null }
    | {
        readonly status: "investigation";
        readonly victim: Player | null;
        readonly target: string;
        readonly isWolfNearby: boolean;
      }
    | { readonly status: "witch"; readonly victim: Player | null }
    | {
        readonly status: "magician";
        readonly victim: Player | null;
        readonly poisoned: Player | null;
      }
    | {
        readonly status: "spellcaster";
        readonly victim: Player | null;
        readonly poisoned: Player | null;
      }
    | {
        readonly status: "morning";
        readonly victim: Player | null;
        readonly poisoned: Player | null;
      }
    | { readonly status: "day"; readonly nomination: number }
    | {
        readonly status: "vote";
        readonly nomination: number;
        /** The people who can be voted for: up to three nominated people, in the second round only the tied ones. */
        readonly candidates: readonly string[];
        /** The first vote, or the new vote after a tie (only once). */
        readonly round: 1 | 2;
      }
    | { readonly status: "exile"; readonly victim: Player }
    | ({ readonly status: "hunter" | "drunkHunter" } & HunterTurn)
    | { readonly status: "finished"; readonly winner: Side }
  );

export type WerewolfEvent =
  | { readonly type: "roleSeen"; readonly player: string }
  | {
      readonly type:
        | "acknowledgeCall"
        | "wolvesReady"
        | "loversReady"
        | "closeVision"
        | "closeInvestigation"
        | "drunkReady"
        | "announceMorning"
        | "endDay"
        | "announceExile";
      readonly night: number;
    }
  | { readonly type: "attack"; readonly night: number; readonly target: string | null }
  | { readonly type: "passAmulet"; readonly night: number; readonly target: string }
  | { readonly type: "bond"; readonly night: number; readonly players: Lovers }
  | { readonly type: "silence" | "hammer"; readonly night: number; readonly target: string | null }
  | { readonly type: "protect"; readonly night: number; readonly target: string }
  | { readonly type: "stayWith"; readonly night: number; readonly target: string }
  | {
      readonly type: "potions";
      readonly night: number;
      readonly heal: boolean;
      readonly poison: string | null;
    }
  | {
      readonly type: "castSpells";
      readonly night: number;
      readonly heal: boolean;
      readonly kill: readonly string[];
    }
  | { readonly type: "shot"; readonly night: number; readonly target: string | null }
  | { readonly type: "inspect"; readonly night: number; readonly target: string }
  | { readonly type: "investigate"; readonly night: number; readonly target: string | null }
  | {
      /** The narrator names one to three people for the vote. */
      readonly type: "nominate";
      readonly night: number;
      readonly nominees: readonly string[];
    }
  | {
      /**
       * Every voting person names exactly one of the candidates, never himself. The silenced person does not vote.
       * The narrator also sets the vote of the village idiot himself (as in the original: he always votes "to die").
       */
      readonly type: "vote";
      readonly night: number;
      readonly nomination: number;
      readonly ballots: Readonly<Record<string, string>>;
    }
  | {
      /**
       * The vote counted per candidate: the narrator enters how many votes each candidate got. All votes of the voting
       * people have to be added up (the mayor with the double vote counts twice), nobody votes for himself. Who voted
       * for whom is not known then.
       */
      readonly type: "voteCount";
      readonly night: number;
      readonly nomination: number;
      readonly counts: Readonly<Record<string, number>>;
    };
