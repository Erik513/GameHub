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
    expect(quiet.abilities).toEqual([
      { available: false, id: "attack", symbol: "attacked", unavailable: "blocked" },
    ]);
    const attacking = describeNarratorCard(
      at(start([], { attackOnFirstNight: true }), { status: "wolves" }),
    )!;
    expect(attacking.abilities[0]?.available).toBe(true);
    const later = describeNarratorCard(at(start([]), { night: 2, status: "wolves" }))!;
    expect(later.abilities[0]?.available).toBe(true);
  });

  it("gives the witch two potion buttons and marks a used potion", () => {
    const state = at(start(["witch"]), { status: "witch", victim: null });
    const victim = state.players[0]!;
    const attacked = { ...state, wolfTarget: victim } as WerewolfState;
    const witch = describeNarratorCard(attacked)!;
    expect(witch.abilities.map((a) => a.id)).toEqual(["heal", "poison"]);
    expect(witch.abilities.every((a) => a.available)).toBe(true);
    // Used up for good: neutral.
    const spent = describeNarratorCard({ ...attacked, potions: { heal: false, poison: true } })!;
    expect(spent.abilities.map((a) => [a.available, a.unavailable])).toEqual([
      [false, "used"],
      [true, undefined],
    ]);
  });

  it("marks the healing potion as not possible (not used) when the wolves did not attack", () => {
    const state = at(start(["witch"]), { status: "witch", victim: null, wolfTarget: null });
    const [heal, poison] = describeNarratorCard(state)!.abilities;
    expect(heal).toMatchObject({ available: false, id: "heal", unavailable: "blocked" });
    expect(poison).toMatchObject({ available: true, id: "poison" });
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
      ["amuletPass", "amuletPass"],
    ];
    for (const [status, role] of roles)
      expect(
        describeNarratorCard(at(base, { ...stepFields(base, status), status }))?.role,
        status,
      ).toBe(role);
    for (const status of ["morning", "exile", "finished"])
      expect(describeNarratorCard(at(base, { status })), status).toBeNull();
    // The day has a card of its own: the vote names the nominated person.
    expect(describeNarratorCard(at(base, { status: "day" }))).toMatchObject({
      abilities: [{ available: true, id: "vote" }],
      actors: [],
      role: "day",
    });
    expect(
      describeNarratorCard(at(base, { candidates: ["Anna"], round: 1, status: "vote" })),
    ).toMatchObject({
      abilities: [],
      actors: ["Anna"],
      role: "day",
    });
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

  it("shows all the effects from outside on the awake people", () => {
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
    expect(describeNarratorCard(marked)!.effects).toEqual([
      "lovers",
      "amulet",
      "protected",
      "silenced",
    ]);
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

  it("calls the apprentice instead of the seer once the seer is dead", () => {
    const base = start(["apprenticeSeer"]);
    const seen = at(base, { status: "seer", victim: null });
    expect(describeNarratorCard(seen)?.role).toBe("seer");
    const apprentice = base.alive.find((p) => p.role === "apprenticeSeer")!;
    const without = {
      ...seen,
      alive: base.alive.filter((p) => p.role !== "seer"),
    } as WerewolfState;
    const card = describeNarratorCard(without)!;
    expect(card.role).toBe("apprenticeSeer");
    expect(card.actors).toEqual([apprentice.name]);
    expect(card.abilities).toEqual([{ available: true, id: "inspect", symbol: "seer" }]);
    expect(
      describeNarratorCard(at(without, { status: "vision", target: "x", isWolf: false }))?.role,
    ).toBe("apprenticeSeer");
    const cover = describeNarratorCard(
      at(without, { call: "seer", resume: without, status: "nightCall" }),
    )!;
    expect(cover.role).toBe("apprenticeSeer");
    expect(cover.cover).toBe(true);
    // Without an apprentice in the game the seer step stays "the seer".
    const lonely = { ...at(start([]), { status: "seer", victim: null }) };
    expect(
      describeNarratorCard({ ...lonely, alive: lonely.alive.filter((p) => p.role !== "seer") })
        ?.role,
    ).toBe("seer");
  });

  it("shows an effect for several awake people only when all of them have it", () => {
    const base = start(["witch"], { amulet: true });
    const [one, two] = base.players;
    const state = {
      ...base,
      amulet: { holder: one!.name, mustPass: false },
      lovers: [one!.name, two!.name],
      ...stepFields(base, "lovers"),
      status: "lovers",
    } as WerewolfState;
    const card = describeNarratorCard(state)!;
    expect(card.actors).toHaveLength(2);
    // Both are in love, but only one holds the amulet: the amulet is not shown.
    expect(card.effects).toEqual(["lovers"]);
  });

  it("shows the holder of the amulet with his own role and says that an attack is why he has to pass it", () => {
    const base = start(["witch"], { amulet: true });
    const witch = base.players.find((player) => player.role === "witch")!;
    const must = at(base, {
      amulet: { holder: witch.name, mustPass: true },
      poisoned: null,
      status: "amuletPass",
      victim: null,
    });
    const card = describeNarratorCard(must)!;
    expect(card.role).toBe("amuletPass");
    expect(card.holderRole).toBe("witch");
    expect(card.effects).toContain("amulet");
    expect(card.effects).toContain("attacked");
    const may = describeNarratorCard({
      ...must,
      amulet: { holder: witch.name, mustPass: false },
    })!;
    expect(may.effects).toContain("amulet");
    expect(may.effects).not.toContain("attacked");
  });
});
