import { describePlayers } from "./selectors";
import { wakingPlayers, type WerewolfState } from "./stateMachine";

/** The symbols the card shows; the presentation draws them (every id is a symbol of the symbol set). */
export type CardRoleSymbol =
  | "wolf"
  | "seer"
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
  | "amulet"
  | "amuletPass";
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
  | "passAmulet";
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
  | "amuletPass";
export type CardEffect =
  "lovers" | "amulet" | "attacked" | "protected" | "guest" | "poisoned" | "silenced" | "drunk";

export interface CardAbility {
  readonly id: CardAbilityId;
  readonly symbol: CardAbilitySymbol;
  /** Green when true (the narrator can use it now), red when false (used up or not possible). */
  readonly available: boolean;
  /** What is left of a limited ability, like the spells of the magician. */
  readonly count?: number;
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
}

const maximumEffects = 3;

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

function cardRole(state: WerewolfState): CardRoleSymbol | null {
  switch (state.status) {
    case "nightCall":
      return roleOfCall[state.call];
    case "wolves":
      return "wolf";
    case "seer":
    case "vision":
      return "seer";
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
    case "amuletIntro":
      return "amulet";
    case "amuletPass":
      return "amuletPass";
    default:
      return null;
  }
}

function abilitiesOf(state: WerewolfState, role: CardRoleSymbol): readonly CardAbility[] {
  switch (role) {
    case "wolf":
      return [
        {
          available: state.night > 1 || state.settings.attackOnFirstNight,
          id: "attack",
          symbol: "attacked",
        },
      ];
    case "seer":
      return [{ available: state.status === "seer", id: "inspect", symbol: "seer" }];
    case "paranormalInvestigator":
      return [{ available: !state.investigationUsed, id: "investigate", symbol: "investigation" }];
    case "witch":
      return [
        { available: state.potions.heal, id: "heal", symbol: "heal" },
        { available: state.potions.poison, id: "poison", symbol: "kill" },
      ];
    case "magician":
      return [
        {
          available: state.spellsRemaining > 0,
          count: state.spellsRemaining,
          id: "heal",
          symbol: "heal",
        },
        {
          available: state.spellsRemaining > 0,
          count: state.spellsRemaining,
          id: "kill",
          symbol: "kill",
        },
      ];
    case "bodyguard":
      return [{ available: true, id: "protect", symbol: "protected" }];
    case "nightGuest":
      return [{ available: true, id: "stayWith", symbol: "guest" }];
    case "cupid":
      return [{ available: true, id: "bond", symbol: "lovers" }];
    case "mayor":
      return [
        {
          available: state.settings.mayor === "hammer" && !state.hammerUsed && state.night >= 2,
          id: "hammer",
          symbol: "hammer",
        },
      ];
    case "spellcaster":
      return [{ available: true, id: "silence", symbol: "silenced" }];
    case "hunter":
      return [{ available: true, id: "shot", symbol: "shotDuty" }];
    case "amuletPass":
      return [{ available: true, id: "passAmulet", symbol: "amuletPass" }];
    default:
      return [];
  }
}

/** The effects from outside on the awake people, most important first, at most three, each one once. */
function effectsOf(state: WerewolfState, actors: readonly string[]): readonly CardEffect[] {
  const found = new Set<CardEffect>();
  const people = describePlayers(state).filter((person) => actors.includes(person.name));
  const poisoned = "poisoned" in state ? state.poisoned?.name : undefined;
  for (const person of people) {
    if (person.partner) found.add("lovers");
    if (person.amulet) found.add("amulet");
    if (state.wolfTarget?.name === person.name) found.add("attacked");
    if (state.protectedPlayer === person.name) found.add("protected");
    if (state.hostPlayer === person.name) found.add("guest");
    if (poisoned === person.name) found.add("poisoned");
    if (person.silenced) found.add("silenced");
    if (person.drunk && person.alive) found.add("drunk");
  }
  return [...found].slice(0, maximumEffects);
}

/** The card of the role that is awake, or null when no role is awake (the day, the morning, the end). */
export function describeNarratorCard(state: WerewolfState): NarratorCard | null {
  const role = cardRole(state);
  if (!role) return null;
  const cover = state.status === "nightCall";
  const actors = cover ? [] : wakingPlayers(state);
  return {
    abilities: abilitiesOf(state, role).map((ability) =>
      cover ? { ...ability, available: false } : ability,
    ),
    actors,
    cover,
    effects: effectsOf(state, actors),
    role,
  };
}
