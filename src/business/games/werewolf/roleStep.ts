import { describeNarratorCard } from "./narratorCard";
import { validTargets } from "./selectors";
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

export interface RoleStepSpec {
  readonly variant: RoleStepVariant;
  readonly kind: "choose" | "result" | "info" | "day" | "plain";
  /** The role may also do nothing: the step offers "skip" next to the ability, and both are framed. */
  readonly skippable: boolean;
  /** The victim of the wolves is named in the step (the witch and the magician decide about it). */
  readonly showsVictim: boolean;
  /** Present while the step names one person. */
  readonly pick?: PickSpec;
}

const spec = (
  variant: RoleStepVariant,
  kind: RoleStepSpec["kind"],
  more: Partial<Pick<RoleStepSpec, "showsVictim" | "skippable">> = {},
): RoleStepSpec => ({ kind, showsVictim: false, skippable: false, variant, ...more });

/** How the guide shows the step of the game that is about to be played. */
export function describeRoleStep(state: WerewolfState): RoleStepSpec {
  const base = baseStep(state);
  const pick = pickOf(state, base.skippable);
  return pick ? { ...base, pick } : base;
}

function pickOf(state: WerewolfState, skippable: boolean): PickSpec | undefined {
  const one = (event: PickEvent, more: Partial<PickSpec> = {}): PickSpec => ({
    event,
    nobody: false,
    skipTarget: null,
    ...more,
  });
  switch (state.status) {
    case "wolves":
      // Only an attack names a person; the first night without attack is a step of its own.
      return state.night === 1 && !state.settings.attackOnFirstNight
        ? undefined
        : one("attack", { nobody: true });
    case "seer":
      return one("inspect");
    case "investigator":
      return one("investigate");
    case "bodyguard":
      return one("protect");
    case "nightGuest":
      return one("stayWith");
    case "mayor":
      return one("hammer");
    case "spellcaster":
      return one("silence");
    case "hunter":
      return one("shot");
    case "amuletPass":
      // Keeping the amulet: the holder is his own target; he is not in the list of people then.
      return one("passAmulet", {
        skipTarget: state.amulet.holder,
        ...(skippable ? { excludes: state.amulet.holder } : {}),
      });
    default:
      return undefined;
  }
}

function baseStep(state: WerewolfState): RoleStepSpec {
  const usable =
    describeNarratorCard(state)?.abilities.some((ability) => ability.available) ?? false;
  switch (state.status) {
    case "nightCall":
      return spec("cover", "info");
    case "wolves":
      return state.night === 1 && !state.settings.attackOnFirstNight
        ? spec("wolvesNoAttack", "info")
        : spec("wolvesAttack", "choose");
    case "seer":
      return spec("seerChoose", "choose");
    case "vision":
      return spec("seerResult", "result");
    case "investigator":
      return usable
        ? spec("investigatorChoose", "choose", { skippable: true })
        : spec("investigatorUsed", "info");
    case "investigation":
      return spec("investigatorResult", "result");
    case "witch":
      return usable
        ? spec("witchPotions", "choose", { showsVictim: true, skippable: true })
        : spec("witchEmpty", "info", { showsVictim: true });
    case "magician":
      return usable
        ? spec("magicianSpells", "choose", { showsVictim: true, skippable: true })
        : spec("magicianEmpty", "info", { showsVictim: true });
    case "bodyguard":
      return spec("bodyguardProtect", "choose");
    case "nightGuest":
      return spec("nightGuestStay", "choose");
    case "cupid":
      return spec("cupidBond", "choose");
    case "spellcaster":
      // The old hag has to silence somebody; only when nobody can be chosen (very rare) the step may be skipped.
      return spec("spellcasterSilence", "choose", {
        skippable: validTargets(state, "silence").length === 0,
      });
    case "mayor":
      return usable
        ? spec("mayorHammer", "choose", { skippable: true })
        : spec("mayorUnavailable", "info");
    case "hunter":
    case "drunkHunter":
      // The setting decides: the hunter may leave the shot out, or has to shoot.
      return state.settings.hunterShot === "required"
        ? spec("hunterRequired", "choose")
        : spec("hunterOptional", "choose", { skippable: true });
    case "lovers":
      return spec("loversInfo", "info");
    case "drunkReveal":
      return spec("drunkInfo", "info");
    case "amuletPass":
      // After an attack the holder has to pass the amulet on; otherwise he may keep it (the logic takes himself as the target).
      return state.amulet.mustPass
        ? spec("amuletPassMust", "choose")
        : spec("amuletPassMay", "choose", { skippable: true });
    case "day":
      return spec("day", "day");
    case "vote":
      return spec("vote", "day");
    default:
      return spec("plain", "plain");
  }
}
