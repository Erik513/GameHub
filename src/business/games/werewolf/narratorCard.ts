import { describePlayers } from "./selectors";
import { wakingPlayers, type WerewolfState } from "./stateMachine";

/** The symbols the card shows; the presentation draws them (every id is a symbol of the symbol set). */
export type CardRoleSymbol =
  | "wolf"
  | "seer"
  | "apprenticeSeer"
  | "witch"
  | "hunter"
  | "bodyguard"
  | "nightGuest"
  | "cupid"
  | "spellcaster"
  | "mayor"
  | "paranormalInvestigator"
  | "magician"
  | "lovers"
  | "drunk"
  | "amuletPass"
  | "day";
export type CardAbilityId =
  | "attack"
  | "inspect"
  | "investigate"
  | "heal"
  | "poison"
  | "kill"
  | "protect"
  | "stayWith"
  | "bond"
  | "hammer"
  | "silence"
  | "shot"
  | "passAmulet"
  | "vote";
export type CardAbilitySymbol =
  | "attacked"
  | "seer"
  | "investigation"
  | "heal"
  | "kill"
  | "protected"
  | "guest"
  | "lovers"
  | "hammer"
  | "silenced"
  | "shotDuty"
  | "amuletPass"
  | "vote";
export type CardEffect =
  "lovers" | "amulet" | "attacked" | "protected" | "guest" | "poisoned" | "silenced" | "drunk";

export interface CardAbility {
  readonly id: CardAbilityId;
  readonly symbol: CardAbilitySymbol;
  /** Green when true (the narrator can use it now), red when false (used up or not possible). */
  readonly available: boolean;
  /**
   * Why it cannot be used: "used" (used up for good, neutral) or "blocked" (possible in principle, but not now, for
   * example the healing potion when the wolves did not attack). Absent while it can be used.
   */
  readonly unavailable?: "blocked" | "used";
  /** What is left of a limited ability, like the spells of the magician. */
  readonly count?: number;
  /** Used up by using it (a potion, a spell, the hammer, the one look of the investigator), not there again every night. */
  readonly consumable?: true;
}

/** What the upper box of the narrator view shows for the role that is awake now. */
export interface NarratorCard {
  readonly role: CardRoleSymbol;
  /** The people who are awake; empty for a cover call (the role is called, nobody acts). */
  readonly actors: readonly string[];
  /** A cover call: the narrator still calls the role, but nothing can be decided. */
  readonly cover: boolean;
  /** Up to three effects from outside on the people who are awake. */
  readonly effects: readonly CardEffect[];
  readonly abilities: readonly CardAbility[];
  /**
   * The real role of the person who is awake, when the step is not a role of its own: the amulet is only an addition,
   * so its holder is shown with the role he has (the amulet is one of his effects).
   */
  readonly holderRole?: string | undefined;
}

/** The steps of the day: the effects of the night are not shown there. */
const dayStatuses: readonly WerewolfState["status"][] = [
  "morning",
  "day",
  "vote",
  "exile",
  "hunter",
  "drunkHunter",
  "finished",
];

type NightCallRole = Extract<WerewolfState, { status: "nightCall" }>["call"];

const roleOfCall: Record<NightCallRole, CardRoleSymbol> = {
  amuletPass: "amuletPass",
  bodyguard: "bodyguard",
  cupid: "cupid",
  drunkReveal: "drunk",
  investigator: "paranormalInvestigator",
  lovers: "lovers",
  magician: "magician",
  mayor: "mayor",
  nightGuest: "nightGuest",
  seer: "seer",
  spellcaster: "spellcaster",
  witch: "witch",
  wolves: "wolf",
};

/**
 * The seer step is called "the seer" while a seer lives. After the death of the seer the apprentice takes over and
 * the step is called "the apprentice seer" (the public call of the night script).
 */
function seerRole(state: WerewolfState): CardRoleSymbol {
  return !state.alive.some((p) => p.role === "seer") &&
    state.players.some((p) => p.role === "apprenticeSeer")
    ? "apprenticeSeer"
    : "seer";
}

function cardRole(state: WerewolfState): CardRoleSymbol | null {
  switch (state.status) {
    case "nightCall":
      return state.call === "seer" ? seerRole(state) : roleOfCall[state.call];
    case "wolves":
      return "wolf";
    case "seer":
    case "vision":
      return seerRole(state);
    case "investigator":
    case "investigation":
      return "paranormalInvestigator";
    case "witch":
    case "magician":
    case "mayor":
    case "bodyguard":
    case "nightGuest":
    case "cupid":
    case "spellcaster":
    case "lovers":
      return state.status;
    case "drunkReveal":
      return "drunk";
    case "hunter":
    case "drunkHunter":
      return "hunter";
    case "amuletPass":
      return "amuletPass";
    case "day":
    case "vote":
      return "day";
    default:
      return null;
  }
}

/** One ability; `why` says why it cannot be used (undefined: it can). */
function ability(
  id: CardAbilityId,
  symbol: CardAbilitySymbol,
  why?: "blocked" | "used",
  count?: number,
): CardAbility {
  return {
    available: why === undefined,
    id,
    symbol,
    ...(why === undefined ? {} : { unavailable: why }),
    ...(count === undefined ? {} : { count }),
  };
}

/** Marks an ability that is used up by using it. */
function consumable(entry: CardAbility): CardAbility {
  return { ...entry, consumable: true };
}

function abilitiesOf(state: WerewolfState, role: CardRoleSymbol): readonly CardAbility[] {
  switch (role) {
    case "wolf":
      return [
        ability(
          "attack",
          "attacked",
          state.night > 1 || state.settings.attackOnFirstNight ? undefined : "blocked",
        ),
      ];
    case "seer":
    case "apprenticeSeer":
      // After the result was shown the narrator can still look at another person (a wrong person was chosen).
      return [
        ability(
          "inspect",
          "seer",
          state.status === "seer" || state.status === "vision" ? undefined : "blocked",
        ),
      ];
    case "paranormalInvestigator":
      return [
        consumable(
          ability("investigate", "investigation", state.investigationUsed ? "used" : undefined),
        ),
      ];
    case "witch":
      return [
        consumable(
          ability(
            "heal",
            "heal",
            !state.potions.heal ? "used" : state.wolfTarget ? undefined : "blocked",
          ),
        ),
        consumable(ability("poison", "kill", state.potions.poison ? undefined : "used")),
      ];
    case "magician": {
      const left = state.spellsRemaining;
      return [
        consumable(
          ability(
            "heal",
            "heal",
            left <= 0 ? "used" : state.wolfTarget ? undefined : "blocked",
            left,
          ),
        ),
        consumable(ability("kill", "kill", left <= 0 ? "used" : undefined, left)),
      ];
    }
    case "bodyguard":
      return [ability("protect", "protected")];
    case "nightGuest":
      return [ability("stayWith", "guest")];
    case "cupid":
      return [ability("bond", "lovers")];
    case "mayor":
      return [
        consumable(
          ability(
            "hammer",
            "hammer",
            state.hammerUsed
              ? "used"
              : state.settings.mayor === "hammer" && state.night >= 2
                ? undefined
                : "blocked",
          ),
        ),
      ];
    case "spellcaster":
      return [ability("silence", "silenced")];
    case "hunter":
      return [ability("shot", "shotDuty")];
    case "amuletPass":
      return [ability("passAmulet", "amuletPass")];
    case "day":
      // The vote itself needs no button: the narrator only names who votes yes.
      return state.status === "day" ? [ability("vote", "vote")] : [];
    default:
      return [];
  }
}

/**
 * The effects from outside on the awake people, most important first, each one once. When several people
 * are awake (the wolves, the lovers) only an effect that all of them have is shown, so it is never taken for a property
 * of one person.
 */
function effectsOf(state: WerewolfState, actors: readonly string[]): readonly CardEffect[] {
  const people = describePlayers(state).filter((person) => actors.includes(person.name));
  const poisoned = "poisoned" in state ? state.poisoned?.name : undefined;
  // What the night did to a person (attacked, protected, guest, poisoned) is of no interest in the day.
  const night = !dayStatuses.includes(state.status);
  const effectsOfPerson = (person: (typeof people)[number]): CardEffect[] => {
    const found: CardEffect[] = [];
    if (person.partner) found.push("lovers");
    if (person.amulet) found.push("amulet");
    if (night && state.wolfTarget?.name === person.name) found.push("attacked");
    // The amulet stopped an attack: this is why the holder has to pass it on.
    if (
      state.status === "amuletPass" &&
      state.amulet.mustPass &&
      state.amulet.holder === person.name
    )
      found.push("attacked");
    if (night && state.protectedPlayer === person.name) found.push("protected");
    if (night && state.hostPlayer === person.name) found.push("guest");
    if (night && poisoned === person.name) found.push("poisoned");
    if (person.silenced) found.push("silenced");
    if (person.drunk && person.alive) found.push("drunk");
    return found;
  };
  const [first, ...others] = people.map(effectsOfPerson);
  if (!first) return [];
  const shared = first.filter((effect) => others.every((rest) => rest.includes(effect)));
  return shared;
}

/** The card of the role that is awake, or null when no role is awake (the day, the morning, the end). */
export function describeNarratorCard(state: WerewolfState): NarratorCard | null {
  const role = cardRole(state);
  if (!role) return null;
  const cover = state.status === "nightCall";
  // At the vote the card names the nominated person; during the day nobody is awake.
  const actors = cover
    ? []
    : state.status === "vote"
      ? [...state.candidates]
      : wakingPlayers(state);
  return {
    abilities: abilitiesOf(state, role).map((ability) =>
      cover
        ? { ...ability, available: false, unavailable: ability.unavailable ?? "blocked" }
        : ability,
    ),
    actors,
    cover,
    effects: effectsOf(state, actors),
    ...(state.status === "amuletPass"
      ? { holderRole: state.players.find((player) => player.name === state.amulet.holder)?.role }
      : {}),
    role,
  };
}
