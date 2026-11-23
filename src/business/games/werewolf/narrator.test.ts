import { describe, expect, it } from "vitest";
import {
  createWerewolf,
  transitionWerewolf,
  werewolfAnnouncement,
  type WerewolfEvent,
  type WerewolfSettings,
  type WerewolfSpecialRole,
  type WerewolfState,
} from "./stateMachine";
import { describePlayers, validTargets, votingPlayers } from "./selectors";
import { nightScript } from "./nightScript";
import { eventChoices as choices } from "./eventChoices";
import { createVariableWerewolf } from "./variableSetup";
import { advanceWerewolfSession, createWerewolfSession, undoWerewolfSession } from "./session";

const act = (s: WerewolfState, ...events: WerewolfEvent[]) => events.reduce(transitionWerewolf, s);
function game(
  roles: readonly WerewolfSpecialRole[] = [],
  settings: Partial<WerewolfSettings> = {},
) {
  const s = createWerewolf(
    Array.from({ length: 18 }, (_, i) => "P" + i).join(","),
    "Narrator",
    () => 0.99,
    roles,
    { wolfCount: 4, ...settings },
  )!;
  return act(s, ...s.players.map((p) => ({ type: "roleSeen", player: p.name }) as const));
}
function vision(s: WerewolfState) {
  if (s.status !== "seer") return s;
  return act(
    s,
    { type: "inspect", night: s.night, target: validTargets(s)[0]! },
    { type: "closeVision", night: s.night },
  );
}
const morning = (s: WerewolfState) => act(s, { type: "announceMorning", night: s.night });
function nextNight(s: WerewolfState) {
  return act(morning(s), { type: "endDay", night: s.night });
}
function noAttack(s: WerewolfState) {
  return vision(
    act(s, {
      type: s.night === 1 && !s.settings.attackOnFirstNight ? "wolvesReady" : "attack",
      night: s.night,
      target: null,
    }),
  );
}

describe("narrator business contract", () => {
  it("orders roles deterministically and keeps time-specific calls in their assigned nights", () => {
    const initial = game(
      [
        "cupid",
        "mayor",
        "witch",
        "magician",
        "spellcaster",
        "hunter",
        "bodyguard",
        "paranormalInvestigator",
      ],
      { mayor: "hammer" },
    );
    expect(nightScript(initial).map((c) => c.id)).toEqual([
      "cupid",
      "lovers",
      "drunkReveal",
      "bodyguard",
      "nightGuest",
      "wolves",
      "seer",
      "investigator",
      "witch",
      "magician",
      "mayor",
      "spellcaster",
      "amuletPass",
    ]);
    expect(nightScript(initial).find((c) => c.id === "mayor")?.mode).toBe("skip");
    expect(nightScript({ ...initial, night: 2 }).find((c) => c.id === "mayor")?.mode).toBe(
      "active",
    );
    const dead = { ...initial, alive: initial.alive.filter((p) => p.role !== "witch") };
    expect(nightScript(dead).find((c) => c.id === "witch")?.mode).toBe("skip");
    const spent = {
      ...initial,
      potions: { heal: false, poison: false },
      spellsRemaining: 0,
      investigationUsed: true,
      hammerUsed: true,
      night: 2,
    };
    // A living role with a used-up ability is called with its whole script (not as a cover call).
    for (const role of ["witch", "magician", "investigator", "mayor"])
      expect(nightScript(spent).find((c) => c.id === role)?.mode).toBe("active");
  });

  it("skips undrawn variable roles throughout the actual night", () => {
    const result = createVariableWerewolf(
      Array.from({ length: 10 }, (_, i) => "P" + i).join(","),
      "Narrator",
      () => 0.99,
      {
        rolePool: ["cupid", "witch", "nightGuest"],
        roleRange: { minimum: 0, maximum: 0 },
        itemPool: ["drunk"],
        wolfCounts: [2],
      },
    );
    if (!result.ok) throw Error(result.reason);
    let s = act(
      result.game,
      ...result.game.players.map((p) => ({ type: "roleSeen", player: p.name }) as const),
    );
    expect(s.status).toBe("wolves");
    expect(act(s, { type: "acknowledgeCall", night: 1 })).toBe(s);
    s = noAttack(s);
    expect(s.status).toBe("morning");
    expect(s.history.some((e) => e.kind === "action" && e.event.type === "acknowledgeCall")).toBe(
      false,
    );
    expect(nightScript({ ...s, night: 3 }).find((c) => c.id === "drunkReveal")?.mode).toBe("skip");
  });

  it("resolves hammer overlaps once and records every effective cause with its actor", () => {
    let s = game(["mayor", "witch", "magician", "spellcaster"], { mayor: "hammer" });
    s = noAttack(s);
    s = act(
      s,
      { type: "potions", night: 1, heal: false, poison: null },
      { type: "castSpells", night: 1, heal: false, kill: [] },
      { type: "silence", night: 1, target: s.players.find((p) => p.role === "mayor")!.name },
    );
    s = nextNight(s);
    const mayor = s.players.find((p) => p.role === "mayor")!.name;
    const witch = s.players.find((p) => p.role === "witch")!.name;
    const magician = s.players.find((p) => p.role === "magician")!.name;
    s = vision(act(s, { type: "attack", night: 2, target: mayor }));
    s = act(
      s,
      { type: "potions", night: 2, heal: false, poison: mayor },
      { type: "castSpells", night: 2, heal: false, kill: [mayor] },
    );
    expect(s.status).toBe("mayor");
    expect(validTargets(s)).not.toContain(mayor);
    const wrong = s.players.find((p) => p.role === "villager")!.name;
    s = act(s, { type: "hammer", night: 2, target: wrong });
    expect(s.alive.some((p) => p.name === mayor)).toBe(true);
    s = act(s, { type: "silence", night: 2, target: wrong });
    s = morning(s);
    const death = s.history.filter((e) => e.kind === "death");
    expect(death).toHaveLength(1);
    expect(death[0]).toMatchObject({
      kind: "death",
      player: mayor,
      sources: [
        { cause: "wolves" },
        { cause: "witchPoison", actors: [witch] },
        { cause: "magicianKill", actors: [magician] },
        { cause: "hammerBackfire", actors: [mayor] },
      ],
    });
    expect(describePlayers(s).find((p) => p.name === mayor)).toMatchObject({
      alive: false,
      death: death[0],
    });
    expect(s.history.map((e) => e.id)).toEqual(s.history.map((_, i) => i + 1));
  });

  it("validates multi-target selections using remaining spell cost and immutable reducer probes", () => {
    let s = noAttack(game(["magician"]));
    const frozen = JSON.stringify(s);
    const choices = validTargets(s);
    expect(choices).toHaveLength(18);
    expect(validTargets(s, "kill", { selected: [choices[0]!], heal: true })).toEqual([]);
    expect(validTargets(s, "kill", { selected: [choices[0]!] })).not.toContain(choices[0]);
    expect(validTargets(s, "poison")).toEqual([]);
    expect(JSON.stringify(s)).toBe(frozen);
    s = act(s, { type: "castSpells", night: 1, heal: false, kill: [choices[0]!, choices[1]!] });
    expect(validTargets(s)).toEqual([]);
  });

  it("preserves state and log on rejected actions, and undo restores both without randomness", () => {
    const start = game();
    const empty = createWerewolfSession(start);
    expect(undoWerewolfSession(empty)).toEqual({ ok: false, reason: "emptyHistory" });
    expect(advanceWerewolfSession(empty, { type: "endDay", night: 1 })).toBe(empty);
    const passed = advanceWerewolfSession(empty, { type: "wolvesReady", night: 1 });
    const restored = undoWerewolfSession(passed);
    expect(restored.ok).toBe(true);
    if (restored.ok) expect(restored.session.present).toBe(start);
    const dawn = createWerewolfSession(noAttack(start));
    const day = advanceWerewolfSession(dawn, { type: "announceMorning", night: 1 });
    expect(undoWerewolfSession(day)).toEqual({ ok: false, reason: "confirmationRequired" });
    const confirmed = undoWerewolfSession(day, true);
    if (!confirmed.ok) throw Error("undo");
    expect(confirmed.session.present).toBe(dawn.present);
    const stale = act(day.present, { type: "endDay", night: 0 });
    expect(stale).toBe(day.present);
  });
});

it("plays reproducible complete games across all roles, privacy modes and attack settings", () => {
  const all: WerewolfSpecialRole[] = [
    "cupid",
    "bodyguard",
    "witch",
    "magician",
    "mayor",
    "hunter",
    "spellcaster",
    "idiot",
    "toughGuy",
    "apprenticeSeer",
    "paranormalInvestigator",
    "tanner",
  ];
  const visited = new Set<string>();
  const causes = new Set<string>();
  for (let seed = 1; seed <= 100; seed++) {
    let word = seed;
    const random = () => {
      word = (Math.imul(word, 1664525) + 1013904223) >>> 0;
      return word / 2 ** 32;
    };
    const roles = all.map((r) => (r === "bodyguard" && seed % 2 === 0 ? "nightGuest" : r));
    let s = createWerewolf(
      Array.from({ length: 20 }, (_, i) => "P" + i).join(","),
      "Narrator",
      random,
      roles,
      {
        wolfCount: 4,
        mayor: seed % 2 ? "hammer" : "doubleVote",
        drunk: true,
        amulet: true,
        attackOnFirstNight: seed % 2 === 0,
        hunterShot: seed % 2 ? "required" : "optional",
        toughGuy: seed % 2 ? "wolfOnly" : "anyAttack",
        allowSelfSilence: seed % 2 === 0,
        tanner: seed % 2 ? "anyDeath" : "voteOnly",
      },
    )!;
    for (let step = 0; s.status !== "finished"; step++) {
      expect(step).toBeLessThan(500);
      visited.add(s.status);
      const events = choices(s);
      expect(events.length, s.status).toBeGreaterThan(0);
      const event = events[Math.floor(random() * events.length)]!;
      const next = transitionWerewolf(s, event);
      expect(next, event.type).not.toBe(s);
      expect(new Set(next.alive.map((p) => p.name)).size).toBe(next.alive.length);
      expect(transitionWerewolf(s, { type: "endDay", night: s.night - 1 })).toBe(s);
      const died = s.alive.filter((p) => !next.alive.some((q) => p.name === q.name));
      const deaths = next.history.slice(s.history.length).filter((e) => e.kind === "death");
      expect(deaths).toHaveLength(died.length);
      for (const death of deaths) {
        if (death.kind !== "death") continue;
        expect(death.sources.length, death.player).toBeGreaterThan(0);
        for (const source of death.sources) causes.add(source.cause);
      }
      const description = describePlayers(next);
      // The announced dead of the morning or of the exile are shown as dead before the announcement is confirmed.
      const announced =
        next.status === "morning" || next.status === "exile"
          ? werewolfAnnouncement(next).length
          : 0;
      expect(description.filter((p) => p.alive)).toHaveLength(next.alive.length - announced);
      expect(description.filter((p) => p.amulet).length).toBe(next.amulet ? 1 : 0);
      s = next;
    }
    expect(
      new Set(
        s.history
          .filter((e) => e.kind === "death")
          .map((e) => (e.kind === "death" ? e.player : "")),
      ).size,
    ).toBe(s.players.length - s.alive.length);
  }
  for (const status of [
    "nightCall",
    "hunter",
    "witch",
    "magician",
    "mayor",
    "amuletPass",
    "drunkReveal",
  ])
    expect(visited.has(status), status).toBe(true);
  for (const cause of [
    "wolves",
    "witchPoison",
    "magicianKill",
    "hammer",
    "hammerBackfire",
    "heartbreak",
    "vote",
    "hunter",
    "toughGuy",
  ])
    expect(causes.has(cause), cause).toBe(true);
}, 20000);

it("provides the voters of a vote: nobody votes for himself, the mayor counts twice, the idiot is set by the narrator", () => {
  let s = morning(noAttack(game(["idiot", "mayor"])));
  const target = s.alive.find((p) => p.role === "wolf")!.name;
  expect(votingPlayers(s)).toEqual([]);
  // Up to three living people can be named.
  expect(validTargets(s, "nominate", { selected: [target] })).not.toContain(target);
  expect(validTargets(s, "nominate", { selected: s.alive.slice(0, 3).map((p) => p.name) })).toEqual(
    [],
  );
  s = act(s, { type: "nominate", night: 1, nominees: [target] });
  const voters = votingPlayers(s);
  expect(voters.find((p) => p.setByNarrator)?.name).toBe(
    s.players.find((p) => p.role === "idiot")!.name,
  );
  expect(voters.find((p) => p.weight === 2)?.name).toBe(
    s.players.find((p) => p.role === "mayor")!.name,
  );
  // The nominated person is a voter without a choice (the only candidate is himself).
  expect(voters.find((p) => p.name === target)?.choices).toEqual([]);
  expect(voters.find((p) => p.name !== target)?.choices).toEqual([target]);
  const mayor = s.players.find((p) => p.role === "mayor")!.name;
  const disabled = { ...s, silencedPlayer: mayor };
  expect(votingPlayers(disabled).map((p) => p.name)).not.toContain(mayor);
  // Any living person can be named, also when only two are left.
  const two = s.alive.slice(0, 2).map((p) => p.name);
  expect(validTargets({ ...s, status: "day", nomination: 0, alive: s.alive.slice(0, 2) })).toEqual(
    two,
  );
});

it("skips an absent apprentice but conceals an actual masked apprentice after the seer dies", () => {
  const s = game();
  const noSeer = {
    ...s,
    alive: s.alive.filter((p) => p.role !== "seer"),
  };
  expect(nightScript(noSeer).find((p) => p.id === "seer")?.mode).toBe("skip");
  const withApprentice = game(["apprenticeSeer"]);
  const name = withApprentice.players.find((p) => p.role === "apprenticeSeer")!.name;
  const masked = {
    ...withApprentice,
    alive: withApprentice.alive.filter((p) => p.role !== "seer"),
    drunk: { player: name, revealed: false },
  };
  expect(nightScript(masked).find((p) => p.id === "seer")?.mode).toBe("cover");
  expect(
    nightScript({ ...masked, drunk: null, alive: [] }).find((p) => p.id === "seer")?.mode,
  ).toBe("skip");
});

it("does not keep the announcement of the hunter's victim into the next night", () => {
  const initial = game(["hunter", "bodyguard"]);
  const hunter = initial.players.find((p) => p.role === "hunter")!;
  const s: WerewolfState = {
    ...initial,
    status: "hunter",
    hunter,
    next: "wolves",
    alive: initial.alive.filter((p) => p !== hunter && p.role !== "bodyguard"),
  };
  const shot = act(s, {
    type: "shot",
    night: 1,
    target: initial.players.find((p) => p.role === "wolf")!.name,
  });
  // The dead are not called: the night goes straight to the wolves.
  expect(shot.status).toBe("wolves");
  expect(werewolfAnnouncement(shot)).toHaveLength(1);
  const victim = shot.alive.find((p) => p.role !== "wolf")!.name;
  const next = act(shot, { type: "attack", night: 2, target: victim });
  expect(werewolfAnnouncement(next)).toEqual([]);
});
