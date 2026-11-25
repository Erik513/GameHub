import { holdsState } from "./roles/cardEffects";
import type { PassiveRoleId, RoleId } from "./roles/roleIds";
import { stateIds } from "./roles/stateIds";
import { roleDefinition } from "./roles";
import { ability, consumable } from "./roles/cardAbility";
import { roleVariantOf, type RoleVariantId } from "./roleVariant";
import { describePlayers } from "./selectors";
import { wakingPlayers, type WerewolfState } from "./stateMachine";

/** The symbols the card shows; the presentation draws them (every id is a symbol of the symbol set). */
/** The roles and steps a card can show: every role that wakes up, the lovers, the amulet and the day. */
export type CardRoleSymbol = Exclude<RoleId, PassiveRoleId> | "lovers" | "amuletPass" | "day";
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
  | "inspected"
  | "investigation"
  | "heal"
  | "healPotion"
  | "kill"
  | "poisoned"
  | "protected"
  | "guest"
  | "lovers"
  | "hammer"
  | "silenced"
  | "shotDuty"
  | "amuletPass"
  | "vote";
/** A state a person can carry; the list and the order of the slots are in `roles/stateIds.ts`. */
export type CardEffect = (typeof stateIds)[number];

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
  /**
   * Used up by using it (a potion, a spell, the hammer, the one look of the investigator, the lovers of Cupid, the shot of the
   * hunter, passing the amulet): it looks used up as soon as it was decided. The nomination, the attack and the like are
   * there every night or day and are only dimmed.
   */
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
  /**
   * A cover call is only for the people who are the drunk and do not know the role yet: the narrator calls the role as
   * usual, but nobody acts. Their names stand here (private to the narrator); absent for any other card.
   */
  readonly covered?: readonly string[] | undefined;
  /** How the role is played in this game (the hunter with or without the duty to shoot, ...); absent without options. */
  readonly variant?: RoleVariantId | undefined;
}

/**
 * The steps of the day: the effects of the night are not shown there. The morning is not one of them: until its
 * announcement is confirmed the poison, the attack and the protections of the night still show as slots.
 */
const dayStatuses: readonly WerewolfState["status"][] = [
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

function abilitiesOf(state: WerewolfState, role: CardRoleSymbol): readonly CardAbility[] {
  if (role === "amuletPass") return [consumable(ability("passAmulet", "amuletPass"))];
  // The vote itself only asks the narrator who votes yes.
  if (role === "day") return state.status === "day" ? [ability("vote", "vote")] : [];
  return roleDefinition(role)?.cardAbilities(state) ?? [];
}

/**
 * The effects from outside on the awake people, most important first, each one once. When several people
 * are awake (the wolves, the lovers) only an effect that all of them have is shown, so it is never taken for a property
 * of one person.
 */
function effectsOf(state: WerewolfState, actors: readonly string[]): readonly CardEffect[] {
  const people = describePlayers(state).filter((person) => actors.includes(person.name));
  if (people.length === 0) return [];
  const night = !dayStatuses.includes(state.status);
  return stateIds.filter((effect) =>
    people.every((person) => holdsState(effect, { night, person, state })),
  );
}

/** The states one person carries, as the slots of the card show them (the overview of all players shows the same). */
export function effectsOfPerson(
  state: WerewolfState,
  person: ReturnType<typeof describePlayers>[number],
): readonly CardEffect[] {
  const night = !dayStatuses.includes(state.status);
  return stateIds.filter((effect) => holdsState(effect, { night, person, state }));
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
  const variant = roleVariantOf(role, state.settings);
  const covered = cover
    ? state.alive
        .filter((p) => p.role === role && state.drunk?.player === p.name && !state.drunk.revealed)
        .map((p) => p.name)
    : [];
  return {
    abilities: abilitiesOf(state, role).map((ability) =>
      cover
        ? { ...ability, available: false, unavailable: ability.unavailable ?? "blocked" }
        : ability,
    ),
    actors,
    cover,
    effects: effectsOf(state, cover ? covered : actors),
    ...(state.status === "amuletPass"
      ? { holderRole: state.players.find((player) => player.name === state.amulet.holder)?.role }
      : {}),
    role,
    ...(variant ? { variant } : {}),
    ...(covered.length > 0 ? { covered } : {}),
  };
}
