import { recordWerewolfTransition, type WerewolfLogEntry } from "./eventLog";
import { delaysToughGuyAttack, type WoundCause } from "./wounds";
import { nightScript, type NightRole } from "./nightScript";
import { parsePlayers } from "../../shared/players";
import { shuffle } from "../../shared/shuffle";

import {
  standardWerewolfCount,
  validWerewolfRoles,
  type WerewolfSettings,
  type WerewolfSpecialRole,
} from "./configuration";
export type { WerewolfSettings, WerewolfSpecialRole } from "./configuration";
type Role = "wolf" | "seer" | "villager" | WerewolfSpecialRole;
type VisibleRole = Role | "drunk";
type Side = "village" | "wolves";
type Lovers = readonly [string, string];

interface Player {
  readonly name: string;
  readonly role: Role;
}
interface Amulet {
  readonly holder: string;
  readonly mustPass: boolean;
}
interface Match {
  readonly history: readonly WerewolfLogEntry[];
  readonly hammerVictim: string | null;
  readonly narrator: string;
  readonly players: readonly Player[];
  readonly alive: readonly Player[];
  readonly night: number;
  readonly protectedPlayer: string | null;
  /**
   * The person the werewolves attacked this night, as the witch and the magician see them: also when the attack
   * did not kill (the amulet or the bodyguard stopped it). They always see the attacked person, so nobody learns
   * from what they see whether a protection was at work.
   */
  readonly wolfTarget: Player | null;
  readonly hostPlayer: string | null;
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

interface HunterTurn {
  readonly hunter: Player;
  readonly next: "day" | "wolves";
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
    | { readonly status: "vote"; readonly nomination: number; readonly target: string }
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
      readonly type: "nominate";
      readonly night: number;
      readonly target: string;
      readonly nominator: string;
      readonly seconder: string;
    }
  | ({
      readonly type: "vote";
      readonly night: number;
      readonly nomination: number;
    } & ({ readonly yes: number } | { readonly yesVoters: readonly string[] }));

export function createWerewolf(
  text: string,
  narrator: string,
  random: () => number,
  selectedRoles: readonly WerewolfSpecialRole[] = [],
  settings: Partial<WerewolfSettings> = {},
): WerewolfState | null {
  const names = parsePlayers(text);
  const moderator = narrator.trim();
  const hasMagician = selectedRoles.includes("magician");
  const wolves = settings.wolfCount ?? standardWerewolfCount(names.length);
  if (
    !moderator ||
    names.some((name) => name.toLocaleLowerCase() === moderator.toLocaleLowerCase()) ||
    !validWerewolfRoles(names.length, selectedRoles, wolves, settings.wolfCountMode)
  )
    return null;
  const villagers = names.length - wolves - 1 - selectedRoles.length;
  if (villagers < 0 || (settings.drunk && (wolves < 2 || names.length < 9))) return null;
  const deck: Role[] = [
    ...Array<Role>(wolves).fill("wolf"),
    "seer",
    ...selectedRoles,
    ...Array<Role>(villagers).fill("villager"),
  ];
  const roles = shuffle(deck, random);
  const players = names.map((name, i): Player => ({ name, role: roles[i] ?? "villager" }));
  const eligible = settings.drunk ? players.filter((player) => player.role !== "cupid") : [];
  const drunk = eligible.length ? eligible[Math.floor(random() * eligible.length)] : undefined;
  const amuletCandidates = settings.amulet
    ? players.filter((player) => player.role !== "wolf")
    : [];
  const holder = amuletCandidates.length
    ? amuletCandidates[Math.floor(random() * amuletCandidates.length)]
    : undefined;
  return {
    status: "roles",
    history: [],
    hammerVictim: null,
    index: 0,
    narrator: moderator,
    players,
    alive: players,
    night: 1,
    protectedPlayer: null,
    wolfTarget: null,
    hostPlayer: null,
    potions: { heal: true, poison: true },
    spellsRemaining: hasMagician ? 2 : 0,
    spellVictims: [],
    settings: {
      ...(settings.wolfCountMode ? { wolfCountMode: settings.wolfCountMode } : {}),
      mayor: settings.mayor ?? "doubleVote",
      hunterShot: settings.hunterShot ?? "optional",
      toughGuy: settings.toughGuy ?? "wolfOnly",
      allowSelfSilence: settings.allowSelfSilence ?? false,
      drunk: settings.drunk ?? false,
      tanner: settings.tanner ?? "anyDeath",
      amulet: settings.amulet ?? false,
      attackOnFirstNight: settings.attackOnFirstNight ?? false,
      wolfCount: wolves,
    },
    lovers: null,
    silencedPlayer: null,
    hammerUsed: false,
    nightDeaths: [],
    toughGuyDiesOn: null,
    toughGuyWound: null,
    investigationUsed: false,
    drunk: drunk ? { player: drunk.name, revealed: false } : null,
    tannerWinner: null,
    amulet: holder ? { holder: holder.name, mustPass: false } : null,
  };
}

export function getWerewolfWinner(alive: readonly Player[]): Side | null {
  const wolves = alive.filter((player) => player.role === "wolf").length;
  if (!wolves) return "village";
  return wolves * 2 >= alive.length ? "wolves" : null;
}

export function currentWerewolfRole(
  state: WerewolfState,
): { readonly name: string; readonly role: VisibleRole } | null {
  const player = state.status === "roles" ? state.players[state.index] : undefined;
  return player ? { name: player.name, role: visibleRole(state, player) } : null;
}

export function werewolfDrunkReveal(state: WerewolfState): Player | null {
  if (state.status === "drunkHunter") return state.hunter;
  if (state.status !== "drunkReveal") return null;
  return state.alive.find((player) => isMasked(state, player)) ?? null;
}

export function wakingPlayers(state: WerewolfState): readonly string[] {
  switch (state.status) {
    case "amuletPass":
      return [state.amulet.holder];
    case "wolves":
      return playersWithRole(state, "wolf");
    case "seer":
    case "vision": {
      const actor = actingSeer(state);
      return actor ? [actor.name] : [];
    }
    case "investigator":
    case "investigation":
      return playersWithRole(state, "paranormalInvestigator");
    case "bodyguard":
    case "nightGuest":
    case "cupid":
    case "spellcaster":
    case "witch":
    case "magician":
      return playersWithRole(state, state.status);
    case "mayor":
      return state.hammerUsed ? [] : playersWithRole(state, "mayor");
    case "lovers":
      return state.lovers;
    case "drunkReveal":
    case "drunkHunter": {
      const player = werewolfDrunkReveal(state);
      return player ? [player.name] : [];
    }
    case "hunter":
      return [state.hunter.name];
    default:
      return [];
  }
}

function isMasked(state: Match, player: Player): boolean {
  return state.drunk?.player === player.name && !state.drunk.revealed;
}

function visibleRole(state: Match, player: Player): VisibleRole {
  return isMasked(state, player) ? "drunk" : player.role;
}

function findActiveRole(state: Match, role: Role, players = state.alive): Player | undefined {
  return players.find((player) => visibleRole(state, player) === role);
}

function playersWithRole(state: Match, role: Role): string[] {
  return state.alive
    .filter((player) => visibleRole(state, player) === role)
    .map((player) => player.name);
}

function actingSeer(state: Match): Player | undefined {
  const seer = state.alive.find((player) => player.role === "seer");
  return seer ? findActiveRole(state, "seer") : findActiveRole(state, "apprenticeSeer");
}

function enterCall(
  state: Match,
  role: NightRole,
  active: () => WerewolfState,
  next: () => WerewolfState,
): WerewolfState {
  const call = nightScript({ ...state, status: "morning", victim: null, poisoned: null }).find(
    (c) => c.id === role,
  )!;
  if (call.mode === "active") return active();
  const resume = next();
  return call.mode === "cover" ? { ...resume, status: "nightCall", call: role, resume } : resume;
}

function startNight(state: Match, night: number): WerewolfState {
  const next = {
    ...state,
    night,
    nightDeaths: [],
    spellVictims: [],
    hammerVictim: null,
    wolfTarget: null,
  };
  return enterCall(
    next,
    "cupid",
    () => ({ ...next, status: "cupid" }),
    () =>
      enterCall(
        next,
        "lovers",
        () => ({ ...next, status: "lovers", lovers: next.lovers! }),
        () => afterLovers(next),
      ),
  );
}
function afterLovers(state: Match): WerewolfState {
  return enterCall(
    state,
    "drunkReveal",
    () => ({ ...state, status: "drunkReveal" }),
    () => afterDrunkReveal(state),
  );
}
function afterDrunkReveal(state: Match): WerewolfState {
  return beforeWolves(state);
}
function beforeWolves(state: Match): WerewolfState {
  return enterCall(
    state,
    "bodyguard",
    () => ({ ...state, status: "bodyguard" }),
    () =>
      enterCall(
        state,
        "nightGuest",
        () => ({ ...state, status: "nightGuest" }),
        () => wolvesPhase({ ...state, protectedPlayer: null, hostPlayer: null }),
      ),
  );
}
function wolvesPhase(state: Match): WerewolfState {
  return enterCall(
    state,
    "wolves",
    () => ({ ...state, status: "wolves" }),
    () => afterWolves(state, null),
  );
}
/** `victim` is who dies from the attack, `attacked` who the witch and the magician see (the same, unless protected). */
function afterWolves(
  base: Match,
  victim: Player | null,
  attacked: Player | null = victim,
): WerewolfState {
  const state = { ...base, wolfTarget: attacked };
  return enterCall(
    state,
    "seer",
    () => ({ ...state, status: "seer", victim }),
    () => afterVision(state, victim),
  );
}
function afterVision(state: Match, victim: Player | null): WerewolfState {
  return enterCall(
    state,
    "investigator",
    () => ({ ...state, status: "investigator", victim }),
    () => afterInvestigation(state, victim),
  );
}
function afterInvestigation(state: Match, victim: Player | null): WerewolfState {
  return enterCall(
    state,
    "witch",
    () => ({ ...state, status: "witch", victim }),
    () => afterWitch(state, victim, null),
  );
}
function afterWitch(state: Match, victim: Player | null, poisoned: Player | null): WerewolfState {
  return enterCall(
    state,
    "magician",
    () => ({ ...state, status: "magician", victim, poisoned }),
    () => afterPotions(state, victim, poisoned),
  );
}
function afterPotions(state: Match, victim: Player | null, poisoned: Player | null): WerewolfState {
  return enterCall(
    state,
    "mayor",
    () => ({ ...state, status: "mayor", victim, poisoned }),
    () => afterHammer(state, victim, poisoned),
  );
}
function afterHammer(state: Match, victim: Player | null, poisoned: Player | null): WerewolfState {
  return enterCall(
    state,
    "spellcaster",
    () => ({ ...state, status: "spellcaster", victim, poisoned }),
    () => endNight({ ...state, silencedPlayer: null }, victim, poisoned),
  );
}

/** The current owner acts last, before any overnight deaths are announced. */
function endNight(state: Match, victim: Player | null, poisoned: Player | null): WerewolfState {
  const morning = { ...state, status: "morning" as const, victim, poisoned };
  if (!state.amulet) return morning;
  return { ...morning, status: "amuletPass", amulet: state.amulet };
}

function finishResolution(state: Match, next: "day" | "wolves"): WerewolfState {
  const winner = getWerewolfWinner(state.alive);
  if (winner) return { ...state, status: "finished", winner };
  if (next === "wolves") return startNight(state, state.night + 1);
  return { ...state, status: "day", nomination: 0 };
}

function absorbNightAttackWithAmulet(state: Match, target: Player | undefined): Match | null {
  return target && target.name === state.amulet?.holder
    ? { ...state, amulet: { holder: target.name, mustPass: true } }
    : null;
}

function relatedDeaths(state: Match, victims: readonly Player[]): Player[] {
  const names = new Set(victims.map((player) => player.name));
  if (state.lovers?.some((name) => names.has(name))) {
    for (const name of state.lovers) names.add(name);
  }
  return state.alive.filter((player) => names.has(player.name));
}

function applyDeaths(state: Match, deaths: readonly Player[], votedOut?: Player): Match {
  const tanner = deaths.find((player) => player.role === "tanner");
  const won = tanner && (state.settings.tanner === "anyDeath" || tanner === votedOut);
  return {
    ...state,
    alive: state.alive.filter((player) => !deaths.includes(player)),
    tannerWinner: won ? tanner.name : state.tannerWinner,
    amulet: deaths.some((player) => player.name === state.amulet?.holder) ? null : state.amulet,
  };
}

function morningDeaths(state: Extract<WerewolfState, { status: "morning" }>): readonly Player[] {
  const victims = state.spellVictims.filter((p) => !delaysToughGuyAttack(state, p, "magicianKill"));
  if (state.victim && !delaysToughGuyAttack(state, state.victim, "wolves"))
    victims.push(state.victim);
  if (state.poisoned && !delaysToughGuyAttack(state, state.poisoned, "witchPoison"))
    victims.push(state.poisoned);
  if (state.toughGuyDiesOn === state.night) {
    const toughGuy = state.alive.find((player) => player.role === "toughGuy");
    if (toughGuy) victims.push(toughGuy);
  }
  return relatedDeaths(state, [...state.nightDeaths, ...victims]);
}

function woundToughGuy(state: Match, cause: WoundCause, actors: readonly string[]): Match {
  return state.toughGuyDiesOn !== null
    ? state
    : {
        ...state,
        toughGuyDiesOn: state.night + 1,
        toughGuyWound: { cause, actors: [...actors], night: state.night },
      };
}

function announceMorning(state: Extract<WerewolfState, { status: "morning" }>): WerewolfState {
  const deaths = morningDeaths(state);
  const attacks: readonly (readonly [Player | null, WoundCause, readonly string[]])[] = [
    [state.victim, "wolves", playersWithRole(state, "wolf")],
    [state.poisoned, "witchPoison", playersWithRole(state, "witch")],
    ...state.spellVictims.map(
      (p) => [p, "magicianKill", playersWithRole(state, "magician")] as const,
    ),
  ];
  const injury = attacks.find(
    ([p, cause]) => p && delaysToughGuyAttack(state, p, cause) && !deaths.includes(p),
  );
  return announce(injury ? woundToughGuy(state, injury[1], injury[2]) : state, deaths, "day");
}

/**
 * Who left the game, for the announcement of the narrator: the names only. The role of a person who is out is
 * never told by the game; whoever left in the day may reveal it, the others find out by who is no longer woken.
 */
export function werewolfAnnouncement(state: WerewolfState): readonly { name: string }[] {
  const deaths =
    state.status === "morning"
      ? morningDeaths(state)
      : state.status === "exile"
        ? relatedDeaths(state, [state.victim])
        : (state.shotDeaths ?? []);
  const names = new Set(deaths.map((player) => player.name));
  return state.players
    .filter((player) => names.has(player.name))
    .map((player) => ({ name: player.name }));
}

function announce(
  state: Match,
  deaths: readonly Player[],
  next: "day" | "wolves",
  votedOut?: Player,
): WerewolfState {
  const resolved = applyDeaths(state, deaths, votedOut);
  const hunter = deaths.find((player) => player.role === "hunter");
  return hunter
    ? { ...resolved, status: isMasked(state, hunter) ? "drunkHunter" : "hunter", hunter, next }
    : finishResolution(resolved, next);
}

function resolveHammer(
  state: Extract<WerewolfState, { status: "mayor" }>,
  targetName: string | null,
): WerewolfState {
  if (targetName === null) return afterHammer(state, state.victim, state.poisoned);
  const mayor = findActiveRole(state, "mayor");
  const target = state.alive.find((p) => p.name === targetName);
  if (state.hammerUsed || !mayor || !target || mayor === target) return state;
  const nightDeaths = relatedDeaths(state, [target.role === "wolf" ? target : mayor]);
  return afterHammer(
    {
      ...state,
      nightDeaths,
      hammerUsed: true,
      hammerVictim: target.role === "wolf" ? target.name : mayor.name,
    },
    state.victim,
    state.poisoned,
  );
}

function dayVotes(state: Match, event: Extract<WerewolfEvent, { type: "vote" }>) {
  const voters = state.alive.filter((player) => player.name !== state.silencedPlayer);
  const mayor =
    state.settings.mayor === "doubleVote" ? findActiveRole(state, "mayor", voters) : undefined;
  const idiot = findActiveRole(state, "idiot", voters);
  const total = voters.length + Number(mayor !== undefined);
  if ("yes" in event) {
    if (mayor || idiot || !Number.isInteger(event.yes) || event.yes < 0 || event.yes > total)
      return null;
    return { yes: event.yes, total };
  }
  const yes = new Set(event.yesVoters);
  if (
    yes.size !== event.yesVoters.length ||
    [...yes].some((name) => !voters.some((voter) => voter.name === name))
  )
    return null;
  if (idiot) yes.add(idiot.name);
  return { yes: yes.size + Number(mayor !== undefined && yes.has(mayor.name)), total };
}

export function transitionWerewolf(state: WerewolfState, event: WerewolfEvent): WerewolfState {
  if ("night" in event && event.night !== state.night) return state;
  let input = state;
  if (state.shotDeaths) {
    const cleared = { ...state };
    delete cleared.shotDeaths;
    input = cleared;
  }
  const result = applyEvent(input, event);
  return result === input
    ? state
    : recordWerewolfTransition(state, event, result, wakingPlayers(state));
}

function applyEvent(state: WerewolfState, event: WerewolfEvent): WerewolfState {
  switch (state.status) {
    case "nightCall": {
      if (event.type !== "acknowledgeCall") return state;
      const resume = { ...state.resume };
      delete resume.shotDeaths;
      return resume;
    }
    case "roles":
      if (event.type !== "roleSeen" || state.players[state.index]?.name !== event.player)
        return state;
      if (state.index + 1 < state.players.length) return { ...state, index: state.index + 1 };
      // The holder of the amulet learns it from the card of the role reveal: the night begins at once.
      return startNight(state, state.night);
    case "amuletPass":
      if (
        event.type !== "passAmulet" ||
        (state.amulet.mustPass && event.target === state.amulet.holder) ||
        !state.alive.some((player) => player.name === event.target)
      )
        return state;
      return {
        ...state,
        status: "morning",
        amulet: { holder: event.target, mustPass: false },
      };
    case "cupid":
      if (
        event.type !== "bond" ||
        event.players[0] === event.players[1] ||
        !event.players.every((name) => state.alive.some((player) => player.name === name))
      )
        return state;
      return { ...state, status: "lovers", lovers: [...event.players] };
    case "lovers":
      return event.type === "loversReady" ? afterLovers(state) : state;
    case "drunkReveal":
      return event.type === "drunkReady" && state.drunk
        ? afterDrunkReveal({ ...state, drunk: { ...state.drunk, revealed: true } })
        : state;
    case "drunkHunter":
      return event.type === "drunkReady" ? { ...state, status: "hunter" } : state;
    case "mayor":
      return event.type === "hammer" ? resolveHammer(state, event.target) : state;
    case "bodyguard":
      if (
        event.type !== "protect" ||
        event.target === state.protectedPlayer ||
        !state.alive.some((player) => player.name === event.target && player.role !== "bodyguard")
      )
        return state;
      return wolvesPhase({ ...state, protectedPlayer: event.target });
    case "nightGuest":
      if (
        event.type !== "stayWith" ||
        event.target === state.hostPlayer ||
        !state.alive.some((player) => player.name === event.target && player.role !== "nightGuest")
      )
        return state;
      return wolvesPhase({ ...state, hostPlayer: event.target });
    case "wolves": {
      if (state.night === 1 && !state.settings.attackOnFirstNight) {
        return event.type === "wolvesReady" ? afterWolves(state, null) : state;
      }
      if (event.type !== "attack") return state;
      if (event.target === null) return afterWolves(state, null);
      const victim = state.alive.find((p) => p.name === event.target && p.role !== "wolf");
      if (!victim) return state;
      if (state.hostPlayer && victim.role === "nightGuest") return afterWolves(state, null);
      const saved = absorbNightAttackWithAmulet(state, victim);
      if (saved) return afterWolves(saved, null, victim);
      if (victim.name === state.protectedPlayer) return afterWolves(state, null, victim);
      if (victim.name !== state.hostPlayer) return afterWolves(state, victim);
      const guest = findActiveRole(state, "nightGuest");
      const savedGuest = absorbNightAttackWithAmulet(state, guest);
      return savedGuest ? afterWolves(savedGuest, null, guest) : afterWolves(state, guest ?? null);
    }
    case "seer": {
      if (event.type !== "inspect") return state;
      const actor = actingSeer(state);
      const target = state.alive.find((player) => player.name === event.target && player !== actor);
      return target
        ? { ...state, status: "vision", target: target.name, isWolf: target.role === "wolf" }
        : state;
    }
    case "vision":
      return event.type === "closeVision" ? afterVision(state, state.victim) : state;
    case "investigator": {
      if (event.type !== "investigate") return state;
      if (event.target === null) return afterInvestigation(state, state.victim);
      const { alive } = state;
      const seat = alive.findIndex((player) => player.name === event.target);
      if (seat === -1) return state;
      const isWolfNearby = [-1, 0, 1].some(
        (offset) => alive[(seat + offset + alive.length) % alive.length]?.role === "wolf",
      );
      return {
        ...state,
        status: "investigation",
        target: event.target,
        isWolfNearby,
        investigationUsed: true,
      };
    }
    case "investigation":
      return event.type === "closeInvestigation" ? afterInvestigation(state, state.victim) : state;
    case "witch": {
      if (event.type !== "potions" || (event.heal && (!state.wolfTarget || !state.potions.heal)))
        return state;
      const target =
        event.poison === null
          ? undefined
          : state.alive.find((player) => player.name === event.poison);
      if (event.poison !== null && (!target || !state.potions.poison)) return state;
      const saved = absorbNightAttackWithAmulet(state, target);
      const poisoned = saved || target?.name === state.protectedPlayer ? null : (target ?? null);
      const next = {
        ...(saved ?? state),
        potions: {
          heal: state.potions.heal && !event.heal,
          poison: state.potions.poison && !target,
        },
      };
      const victim = event.heal ? null : state.victim;
      return afterWitch(next, victim, poisoned);
    }
    case "magician": {
      if (event.type !== "castSpells") return state;
      const picks = new Set(event.kill);
      const cost = event.kill.length + Number(event.heal);
      if (
        cost > state.spellsRemaining ||
        (event.heal && !state.wolfTarget) ||
        picks.size !== event.kill.length
      )
        return state;
      const targets = state.alive.filter((player) => picks.has(player.name));
      if (targets.length !== picks.size) return state;
      const saved = absorbNightAttackWithAmulet(
        state,
        targets.find((player) => player.name === state.amulet?.holder),
      );
      return afterPotions(
        {
          ...(saved ?? state),
          spellsRemaining: state.spellsRemaining - cost,
          spellVictims: targets.filter(
            (player) =>
              player.name !== state.protectedPlayer && player.name !== state.amulet?.holder,
          ),
        },
        event.heal ? null : state.victim,
        state.poisoned,
      );
    }
    case "spellcaster": {
      if (event.type !== "silence") return state;
      const { target } = event;
      if (
        target !== null &&
        (target === state.silencedPlayer ||
          !state.alive.some(
            (player) =>
              player.name === target &&
              (player.role !== "spellcaster" || state.settings.allowSelfSilence),
          ))
      )
        return state;
      return endNight({ ...state, silencedPlayer: target }, state.victim, state.poisoned);
    }
    case "morning":
      return event.type === "announceMorning" ? announceMorning(state) : state;
    case "day": {
      if (event.type === "endDay") return finishResolution(state, "wolves");
      if (
        event.type !== "nominate" ||
        event.nominator === event.seconder ||
        event.nominator === event.target ||
        event.seconder === event.target ||
        state.silencedPlayer === event.nominator ||
        state.silencedPlayer === event.seconder
      )
        return state;
      return [event.nominator, event.seconder, event.target].every((name) =>
        state.alive.some((p) => p.name === name),
      )
        ? { ...state, status: "vote", target: event.target, nomination: state.nomination + 1 }
        : state;
    }
    case "vote": {
      if (event.type !== "vote" || event.nomination !== state.nomination) return state;
      const votes = dayVotes(state, event);
      if (!votes) return state;
      if (votes.yes * 2 <= votes.total) return { ...state, status: "day" };
      const victim = state.alive.find((p) => p.name === state.target);
      return victim ? { ...state, status: "exile", victim } : state;
    }
    case "exile": {
      if (event.type !== "announceExile") return state;
      return announce(state, relatedDeaths(state, [state.victim]), "wolves", state.victim);
    }
    case "hunter": {
      if (event.type !== "shot") return state;
      if (event.target === null)
        return state.settings.hunterShot === "required" && state.alive.length > 0
          ? state
          : finishResolution(state, state.next);
      const target = state.alive.find((player) => player.name === event.target);
      if (!target) return state;

      if (delaysToughGuyAttack(state, target, "hunter"))
        return finishResolution(woundToughGuy(state, "hunter", [state.hunter.name]), state.next);
      const shotDeaths = relatedDeaths(state, [target]);
      return finishResolution({ ...applyDeaths(state, shotDeaths), shotDeaths }, state.next);
    }
    case "finished":
      return state;
  }
}
