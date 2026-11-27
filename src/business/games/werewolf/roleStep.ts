import { roleDefinitions } from "./roles";
import { describeDefinedStep, pick, spec, type RoleSteps } from "./roles/step";
import { describeNarratorCard } from "./narratorCard";
import type { WerewolfState } from "./stateMachine";

/**
 * Every view of a step in the narrator guide. The screen is always the same building block; what differs from role to
 * role (and between the cases of one role) is only this description:
 *
 * - `choose`: the narrator uses an ability and picks people (or skips, when the role may do nothing).
 * - `result`: the narrator reads out what the role sees; nothing is chosen any more.
 * - `info`: the narrator only reads something out or confirms (the lovers, the drunk, a call without a decision).
 * - `day`: the day (nominate and vote); `plain`: a step without an awake role.
 */
export type RoleStepVariant =
  | "wolvesAttack"
  | "wolvesNoAttack"
  | "seerChoose"
  | "seerResult"
  | "investigatorChoose"
  | "investigatorUsed"
  | "investigatorResult"
  | "witchPotions"
  | "witchEmpty"
  | "magicianSpells"
  | "magicianEmpty"
  | "bodyguardProtect"
  | "nightGuestStay"
  | "cupidBond"
  | "spellcasterSilence"
  | "mayorHammer"
  | "mayorUnavailable"
  | "hunterOptional"
  | "hunterRequired"
  | "loversInfo"
  | "drunkInfo"
  | "amuletPassMust"
  | "amuletPassMay"
  | "cover"
  | "day"
  | "vote"
  | "plain";

/** The events of the steps in which the narrator names one person. */
export type PickEvent =
  | "attack"
  | "hammer"
  | "inspect"
  | "investigate"
  | "passAmulet"
  | "protect"
  | "shot"
  | "silence"
  | "stayWith";

/**
 * How a step that names one person works: the event it hands to the game, whether "nobody" is a choice of its own (the
 * wolves), the person the button "skip" stands for (nobody, or the holder himself who keeps the amulet), and who
 * cannot be named in the list.
 */
export interface PickSpec {
  readonly event: PickEvent;
  readonly nobody: boolean;
  /** What "skip" hands to the game as the target. */
  readonly skipTarget: string | null;
  readonly excludes?: string;
}

/** The steps with a choice of several parts: the potions of the witch, the spells of the magician, the pair of Cupid. */
export type CompoundEvent = "bond" | "castSpells" | "nominate" | "potions" | "vote";

/** The events of the steps that the narrator only confirms: nothing is chosen, something is read out or shown. */
export type ConfirmEvent =
  | "acknowledgeCall"
  | "announceExile"
  | "announceMorning"
  | "closeInvestigation"
  | "closeVision"
  | "drunkReady"
  | "loversReady"
  | "wolvesReady";

/**
 * How many people an ability takes. The spells of the magician are shared between healing and killing: a healing
 * spell takes one of them. A nomination takes up to three people.
 */
export function pickLimitOf(
  state: WerewolfState,
  ability: string | null,
  healing: boolean,
): number {
  // At the day up to three people are named; the vote itself takes no list of people (every voter has a ballot).
  if (ability === "vote") return state.status === "vote" ? 0 : 3;
  if (ability === "bond") return 2;
  if (ability === "kill" && "spellsRemaining" in state)
    return Math.max(0, state.spellsRemaining - Number(healing));
  return 1;
}

export interface RoleStepSpec {
  readonly variant: RoleStepVariant;
  readonly kind: "choose" | "result" | "info" | "day" | "plain";
  /** The role may also do nothing: the step offers "skip" next to the ability, and both are framed. */
  readonly skippable: boolean;
  /** The victim of the wolves is named in the step (the witch and the magician decide about it). */
  readonly showsVictim: boolean;
  /** Present while the choice has several parts (potions, spells, the pair of Cupid). */
  readonly compound?: CompoundEvent;
  /** Present while the narrator only confirms the step (nothing is chosen). */
  readonly confirm?: ConfirmEvent;
  /** Present while the step names one person. */
  readonly pick?: PickSpec;
  /** How the button of a skippable step is called, and what the summary says after it was pressed. */
  readonly skip: {
    readonly label: "keep" | "noVote" | "skip";
    readonly summary: "kept" | "noChoice";
  };
  /** What the role saw, in a result step: who was looked at, with which ability, and whether a werewolf was found. */
  readonly result?: {
    readonly ability: "inspect" | "investigate";
    readonly found: boolean;
    readonly name: string;
  };
  /** The summary is a statement of the step itself, not the choice of the narrator (no attack in the first night). */
  readonly statement?: "noAttack";
}

const roleSteps = Object.values(roleDefinitions).reduce<RoleSteps>(
  (steps, role) => ({ ...steps, ...role.steps }),
  {},
);

/** How the guide shows the step of the game that is about to be played. */
export function describeRoleStep(state: WerewolfState): RoleStepSpec {
  const usable =
    describeNarratorCard(state)?.abilities.some((ability) => ability.available) ?? false;
  const defined = describeDefinedStep(roleSteps, state, usable);
  if (defined) return defined;
  switch (state.status) {
    case "nightCall":
      return spec("cover", "choose", { skippable: true, confirm: "acknowledgeCall" });
    case "amuletPass": {
      const offer = { ...pick("passAmulet"), skipTarget: state.amulet.holder };
      return state.amulet.mustPass
        ? // The question is the same every night: "keep" stands there, too, but cannot be chosen.
          spec("amuletPassMust", "choose", {
            pick: offer,
            skip: { label: "keep", summary: "kept" },
          })
        : spec("amuletPassMay", "choose", {
            skip: { label: "keep", summary: "kept" },
            skippable: true,
            pick: { ...offer, excludes: state.amulet.holder },
          });
    }
    case "day":
      return spec("day", "day", {
        skip: { label: "noVote", summary: "noChoice" },
        skippable: true,
        compound: "nominate",
      });
    case "vote":
      return spec("vote", "day", { compound: "vote" });
    case "morning":
      return spec("plain", "plain", { confirm: "announceMorning" });
    case "exile":
      return spec("plain", "plain", { confirm: "announceExile" });
    default:
      return spec("plain", "plain");
  }
}
