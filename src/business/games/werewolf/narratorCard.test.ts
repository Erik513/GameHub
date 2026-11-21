import { describe, expect, it } from "vitest";
import { describeNarratorCard } from "./narratorCard";
import { createWerewolf, type WerewolfState } from "./stateMachine";

const names = "Anna,Ben,Cleo,Dora,Emil,Finn,Gina,Hans,Ida,Jan,Kim,Lea";

function start(
  roles: Parameters<typeof createWerewolf>[3],
  settings: Parameters<typeof createWerewolf>[4] = {},
) {
  return createWerewolf(names, "Max", () => 0.3, roles, settings)!;
}

/** The same game in another step; the card only reads the facts of the game and the step. */
/** The fields a step needs besides the facts of the game. */
function stepFields(state: WerewolfState, status: string): Record<string, unknown> {
  const person = state.players[0]!;
  return (
    {
      amuletIntro: { amulet: { holder: person.name, mustPass: false } },
      amuletPass: { amulet: { holder: person.name, mustPass: true }, poisoned: null, victim: null },
      drunkHunter: { hunter: person, next: "day" },
      hunter: { hunter: person, next: "day" },
      lovers: { lovers: [state.players[0]!.name, state.players[1]!.name] },
    }[status] ?? {}
  );
}

function at(state: WerewolfState, step: Record<string, unknown>): WerewolfState {
  return { ...state, ...step };
}

describe("describeNarratorCard", () => {
  it("has no card during the role reveal", () => {
    expect(describeNarratorCard(start([]))).toBeNull();
  });

  it("shows the wolves, and their attack only when the first night allows it", () => {
    const quiet = describeNarratorCard(at(start([]), { status: "wolves" }))!;
    expect(quiet.role).toBe("wolf");
    expect(quiet.actors.length).toBeGreaterThan(0);
    expect(quiet.abilities).toEqual([{ available: false, id: "attack", symbol: "attacked" }]);
    const attacking = describeNarratorCard(
      at(start([], { attackOnFirstNight: true }), { status: "wolves" }),
    )!;
    expect(attacking.abilities[0]?.available).toBe(true);
    const later = describeNarratorCard(at(start([]), { night: 2, status: "wolves" }))!;
    expect(later.abilities[0]?.available).toBe(true);
  });

  it("gives the witch two potion buttons and marks a used potion", () => {
    const state = at(start(["witch"]), { status: "witch", victim: null });
    const witch = describeNarratorCard(state)!;
    expect(witch.abilities.map((a) => a.id)).toEqual(["heal", "poison"]);
    expect(witch.abilities.every((a) => a.available)).toBe(true);
    const spent = describeNarratorCard({ ...state, potions: { heal: false, poison: true } })!;
    expect(spent.abilities.map((a) => a.available)).toEqual([false, true]);
  });

  it("shows both spells of the magician with the same counter", () => {
    const state = at(start(["magician"]), { poisoned: null, status: "magician", victim: null });
    expect(describeNarratorCard(state)!.abilities.map((a) => [a.id, a.count])).toEqual([
      ["heal", 2],
      ["kill", 2],
    ]);
    const one = describeNarratorCard({ ...state, spellsRemaining: 1 })!;
    expect(one.abilities.map((a) => a.count)).toEqual([1, 1]);
    const none = describeNarratorCard({ ...state, spellsRemaining: 0 })!;
    expect(none.abilities.every((a) => !a.available)).toBe(true);
  });

  it("marks a cover call: nobody acts and every ability is red", () => {
    const base = at(start(["witch"]), { status: "witch", victim: null });
    const card = describeNarratorCard(
      at(base, { call: "witch", resume: base, status: "nightCall" }),
    )!;
    expect(card.cover).toBe(true);
    expect(card.actors).toEqual([]);
    expect(card.role).toBe("witch");
    expect(card.abilities.every((a) => !a.available)).toBe(true);
  });

  it("covers every role of the night with the right card", () => {
    const base = start(["witch"]);
    const roles: [string, string][] = [
      ["seer", "seer"],
      ["vision", "seer"],
      ["investigator", "paranormalInvestigator"],
      ["investigation", "paranormalInvestigator"],
      ["bodyguard", "bodyguard"],
      ["nightGuest", "nightGuest"],
      ["cupid", "cupid"],
      ["spellcaster", "spellcaster"],
      ["mayor", "mayor"],
      ["lovers", "lovers"],
      ["drunkReveal", "drunk"],
      ["hunter", "hunter"],
      ["drunkHunter", "hunter"],
      ["amuletIntro", "amulet"],
      ["amuletPass", "amuletPass"],
    ];
    for (const [status, role] of roles)
      expect(
        describeNarratorCard(at(base, { ...stepFields(base, status), status }))?.role,
        status,
      ).toBe(role);
    for (const status of ["day", "morning", "vote", "exile", "finished"])
      expect(describeNarratorCard(at(base, { status })), status).toBeNull();
    for (const call of [
      "amuletPass",
      "bodyguard",
      "cupid",
      "drunkReveal",
      "investigator",
      "lovers",
      "magician",
      "mayor",
      "nightGuest",
      "seer",
      "spellcaster",
      "witch",
      "wolves",
    ])
      expect(
        describeNarratorCard(at(base, { call, resume: base, status: "nightCall" }))?.cover,
      ).toBe(true);
  });

  it("gives the other roles their buttons", () => {
    const base = start([], { mayor: "hammer" });
    const ids = (status: string, extra: Record<string, unknown> = {}) =>
      describeNarratorCard(
        at(base, { ...stepFields(base, status), status, ...extra }),
      )!.abilities.map((a) => `${a.id}:${a.available}`);
    expect(ids("seer")).toEqual(["inspect:true"]);
    expect(ids("investigator")).toEqual(["investigate:true"]);
    expect(ids("investigator", { investigationUsed: true })).toEqual(["investigate:false"]);
    expect(ids("bodyguard")).toEqual(["protect:true"]);
    expect(ids("nightGuest")).toEqual(["stayWith:true"]);
    expect(ids("cupid")).toEqual(["bond:true"]);
    expect(ids("spellcaster")).toEqual(["silence:true"]);
    expect(ids("hunter")).toEqual(["shot:true"]);
    expect(ids("amuletPass")).toEqual(["passAmulet:true"]);
    expect(ids("mayor", { night: 1 })).toEqual(["hammer:false"]);
    expect(ids("mayor", { night: 2 })).toEqual(["hammer:true"]);
    expect(ids("mayor", { hammerUsed: true, night: 2 })).toEqual(["hammer:false"]);
    expect(ids("lovers")).toEqual([]);
  });

  it("shows the effects from outside on the awake people, at most three", () => {
    const state = at(start(["witch"], { amulet: true }), { status: "witch", victim: null });
    const witch = state.players.find((p) => p.role === "witch")!;
    const other = state.players.find((p) => p.name !== witch.name)!;
    const marked = {
      ...state,
      amulet: { holder: witch.name, mustPass: false },
      lovers: [witch.name, other.name],
      protectedPlayer: witch.name,
      silencedPlayer: witch.name,
    } as WerewolfState;
    expect(describeNarratorCard(marked)!.effects).toEqual(["lovers", "amulet", "protected"]);
    const attacked = {
      ...state,
      amulet: null,
      hostPlayer: witch.name,
      wolfTarget: witch,
    } as WerewolfState;
    expect(describeNarratorCard(attacked)!.effects).toEqual(["attacked", "guest"]);
    const poisoned = at(state, { poisoned: witch });
    expect(describeNarratorCard(at(poisoned, { amulet: null }))!.effects).toContain("poisoned");
    const quiet = { ...state, amulet: null, silencedPlayer: witch.name } as WerewolfState;
    expect(describeNarratorCard(quiet)!.effects).toEqual(["silenced"]);
  });
});
