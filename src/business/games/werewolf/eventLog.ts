import { delaysToughGuyAttack, type WoundCause } from "./wounds";
import { deathTimeOfCause, inOrderOfDeath as orderByDeath } from "./deathOrder";
import type { WerewolfEvent, WerewolfState } from "./stateMachine";

export type DeathCause =
  | "wolves"
  | "witchPoison"
  | "magicianKill"
  | "hammer"
  | "hammerBackfire"
  | "vote"
  | "hunter"
  | "heartbreak"
  | "toughGuy";
export interface DeathSource {
  readonly cause: DeathCause;
  readonly actors: readonly string[];
  readonly originNight: number;
  readonly attackCause?: WoundCause;
}
interface LogBase {
  readonly id: number;
  readonly night: number;
  readonly phase: WerewolfState["status"];
  readonly period: "setup" | "night" | "day";
}
export type WerewolfLogEntry = LogBase &
  (
    | {
        readonly kind: "action";
        readonly event: WerewolfEvent;
        readonly actors: readonly string[];
        readonly targets: readonly string[];
      }
    | {
        readonly kind: "death";
        readonly player: string;
        readonly role: string;
        readonly diedMasked: boolean;
        readonly sources: readonly DeathSource[];
      }
    | {
        readonly kind: "injury";
        readonly player: string;
        readonly actors: readonly string[];
        readonly cause: WoundCause;
      }
  );

/** Records facts for private narrator projections, without translated text or wall-clock time. */
export function recordWerewolfTransition(
  before: WerewolfState,
  event: WerewolfEvent,
  after: WerewolfState,
  actors: readonly string[],
): WerewolfState {
  const history: WerewolfLogEntry[] = [...before.history];
  const append = (
    entry:
      | Omit<Extract<WerewolfLogEntry, { kind: "action" }>, "id" | "night" | "phase" | "period">
      | Omit<Extract<WerewolfLogEntry, { kind: "death" }>, "id" | "night" | "phase" | "period">
      | Omit<Extract<WerewolfLogEntry, { kind: "injury" }>, "id" | "night" | "phase" | "period">,
  ) => {
    history.push({
      ...entry,
      id: history.length + 1,
      night: before.night,
      phase: before.status,
      period:
        before.status === "roles"
          ? "setup"
          : ["day", "vote", "exile"].includes(before.status) ||
              ((before.status === "hunter" || before.status === "drunkHunter") &&
                before.next === "wolves")
            ? "day"
            : "night",
    });
  };
  const targets: string[] = [];
  if ("target" in event && event.target !== null) targets.push(event.target);
  if (event.type === "bond") targets.push(...event.players);
  if (event.type === "roleSeen") targets.push(event.player);
  if (event.type === "vote" && before.status === "vote") targets.push(...before.candidates);
  if (event.type === "potions") {
    if (event.poison) targets.push(event.poison);
    if (event.heal && before.status === "witch" && before.wolfTarget)
      targets.push(before.wolfTarget.name);
  }
  if (event.type === "castSpells") {
    targets.push(...event.kill);
    if (event.heal && before.status === "magician" && before.wolfTarget)
      targets.push(before.wolfTarget.name);
  }
  append({
    kind: "action",
    event: structuredClone(event),
    actors: [...actors],
    targets: [...new Set(targets)],
  });
  const sources = new Map<string, DeathSource[]>();
  const add = (
    name: string | undefined,
    cause: DeathCause,
    names: readonly string[],
    originNight = before.night,
    attackCause?: WoundCause,
  ) => {
    if (name)
      sources.set(name, [
        ...(sources.get(name) ?? []),
        { cause, actors: names, originNight, ...(attackCause ? { attackCause } : {}) },
      ]);
  };
  const roleActors = (role: string) =>
    before.alive
      .filter(
        (p) => p.role === role && !(before.drunk?.player === p.name && !before.drunk.revealed),
      )
      .map((p) => p.name);
  if (before.status === "morning") {
    if (before.victim && !delaysToughGuyAttack(before, before.victim, "wolves"))
      add(before.victim.name, "wolves", roleActors("wolf"));
    if (before.poisoned && !delaysToughGuyAttack(before, before.poisoned, "witchPoison"))
      add(before.poisoned.name, "witchPoison", roleActors("witch"));
    for (const p of before.spellVictims)
      if (!delaysToughGuyAttack(before, p, "magicianKill"))
        add(p.name, "magicianKill", roleActors("magician"));
    if (before.hammerVictim) {
      const victim = before.players.find((p) => p.name === before.hammerVictim)!;
      add(victim.name, victim.role === "mayor" ? "hammerBackfire" : "hammer", roleActors("mayor"));
    }
    if (before.toughGuyDiesOn === before.night) {
      const injured = [...before.history].reverse().find((e) => e.kind === "injury");
      if (injured?.kind === "injury")
        add(injured.player, "toughGuy", injured.actors, injured.night, injured.cause);
    }
  }
  if (before.status === "exile") {
    const vote = [...before.history]
      .reverse()
      .find((e) => e.kind === "action" && e.event.type === "vote");
    // Those who voted for the person who leaves the game.
    const voters =
      vote?.kind === "action" && vote.event.type === "vote"
        ? Object.entries(vote.event.ballots)
            .filter(([, choice]) => choice === before.victim.name)
            .map(([name]) => name)
        : [];
    add(before.victim.name, "vote", [...new Set(voters)]);
  }
  if (before.status === "hunter" && event.type === "shot")
    add(event.target ?? undefined, "hunter", [before.hunter.name]);
  const diedNow = before.alive.filter((p) => !after.alive.some((a) => a.name === p.name));
  for (const player of diedNow) {
    if (!sources.has(player.name) && before.lovers?.includes(player.name)) {
      const partner = before.lovers.find((n) => n !== player.name)!;
      add(player.name, "heartbreak", [partner]);
    }
  }
  // By the time of death (see `deathOrder.ts`); the seat order decides between equal times.
  const own = new Map<string, number>();
  for (const player of diedNow) {
    const times = (sources.get(player.name) ?? [])
      .filter((source) => source.cause !== "heartbreak")
      .map((source) => deathTimeOfCause[source.cause]);
    if (times.length > 0) own.set(player.name, Math.min(...times));
  }
  const dead = orderByDeath(
    diedNow.map((player) => player.name),
    own,
    before.lovers,
  ).map((name) => diedNow.find((player) => player.name === name)!);
  for (const player of dead) {
    append({
      kind: "death",
      player: player.name,
      role: player.role,
      diedMasked: before.drunk?.player === player.name && !before.drunk.revealed,
      sources: sources.get(player.name) ?? [],
    });
  }
  if (after.toughGuyDiesOn !== before.toughGuyDiesOn && after.toughGuyWound) {
    const player = before.alive.find((p) => p.role === "toughGuy")!;
    append({
      kind: "injury",
      player: player.name,
      actors: after.toughGuyWound.actors,
      cause: after.toughGuyWound.cause,
    });
  }
  return { ...after, history };
}
