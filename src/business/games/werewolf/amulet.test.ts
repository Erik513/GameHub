import { expect, it } from "vitest";
import {
  createWerewolf,
  transitionWerewolf,
  wakingPlayers,
  werewolfAnnouncement,
  type WerewolfEvent,
  type WerewolfSettings,
  type WerewolfSpecialRole,
  type WerewolfState,
} from "./stateMachine";
import { lynchEvents } from "./voteTesting";

const names = ["Ada", "Bea", "Cam", "Dan", "Eva", "Flo"];
const apply = (state: WerewolfState, ...events: WerewolfEvent[]) =>
  events.reduce(transitionWerewolf, state);

function deal(
  holder: string,
  roles: WerewolfSpecialRole[] = [],
  settings: Partial<WerewolfSettings> = {},
  seats = names,
) {
  let draws = 0;
  const wolves = seats.length < 9 ? 1 : seats.length < 12 ? 2 : 3;
  const holderIndex = seats.indexOf(holder) - wolves;
  const draw = (holderIndex + 0.5) / (seats.length - wolves);
  const setup = createWerewolf(
    seats.join(","),
    "Narrator",
    () => {
      draws++;
      if (draws < seats.length) return 0.99;
      if (settings.drunk && draws === seats.length) return 0;
      return draw;
    },
    roles,
    { ...settings, amulet: true },
  )!;
  return apply(setup, ...seats.map((player) => ({ type: "roleSeen", player }) as const));
}

// The holder learns about the amulet from the card of the role reveal: the night begins at once.
const open = (state: WerewolfState) => state;
const vision = (state: WerewolfState) =>
  apply(
    state,
    { type: "inspect", night: state.night, target: "Ada" },
    { type: "closeVision", night: state.night },
  );
const firstNight = (state: WerewolfState) =>
  vision(apply(state, { type: "wolvesReady", night: 1 }));
const dawn = (state: WerewolfState) =>
  apply(state, { type: "announceMorning", night: state.night });
const dusk = (state: WerewolfState) => apply(state, { type: "endDay", night: state.night });
/** The werewolves have to attack: where a test used to attack nobody, the first living non-wolf is the victim. */
function firstVictim(state: WerewolfState): string {
  return state.alive.find((player) => player.role !== "wolf")!.name;
}

const attack = (state: WerewolfState, target: string | null) =>
  vision(
    apply(state, { type: "attack", night: state.night, target: target ?? firstVictim(state) }),
  );
const pass = (state: WerewolfState, target: string) =>
  apply(state, { type: "passAmulet", night: state.night, target });

// Transfer is now the last night action, before public morning resolution.
const transfer = (s: WerewolfState, target = s.amulet!.holder) => pass(s, target);
const resolve = (s: WerewolfState, target = s.amulet!.holder) => dawn(transfer(s, target));
const nightTwo = (s: WerewolfState, target = s.amulet!.holder) =>
  dusk(resolve(firstNight(open(s)), target));

it("privately assigns the amulet to a nonwolf even when the drunk conceals a wolf", () => {
  const s = deal("Cam", [], { drunk: true }, [...names, "Gia", "Hugo", "Ira"]);
  // No call of the holder before the first night.
  expect(s.status).toBe("wolves");
  expect(s.drunk?.player).toBe("Ada");
  expect(s.amulet?.holder).toBe("Cam");
  expect(wakingPlayers(s)).not.toContain("Cam");
  expect(werewolfAnnouncement(s)).toEqual([]);
});

it.each([
  [[], "wolves"],
  [["cupid"], "cupid"],
  [["bodyguard"], "bodyguard"],
  [["nightGuest"], "nightGuest"],
  [["cupid", "bodyguard", "witch"], "cupid"],
  [["cupid", "nightGuest", "witch"], "cupid"],
] as const)("starts the first night directly with an amulet and roles %s", (roles, first) => {
  const seats = [...names, "Gia", "Hugo", "Ira", "Jan", "Kim", "Lea"];
  const state = deal("Eva", [...roles], {}, seats);
  expect(state.status).toBe(first);
  expect(state.night).toBe(1);
  expect(state.alive).toHaveLength(seats.length);
  expect(state.amulet).toEqual({ holder: "Eva", mustPass: false });
});

it("offers a voluntary transfer at every night end and requires transfer after protection", () => {
  const first = firstNight(open(deal("Cam")));
  expect(first.status).toBe("amuletPass");
  expect(transfer(first)).toMatchObject({ status: "morning", amulet: { holder: "Cam" } });
  const night = dusk(resolve(first));
  const saved = attack(night, "Cam");
  expect(saved).toMatchObject({
    status: "amuletPass",
    amulet: { holder: "Cam", mustPass: true },
    victim: null,
  });
  expect(pass(saved, "Cam")).toBe(saved);
  expect(pass(saved, "Missing")).toBe(saved);
  const handed = pass(saved, "Dan");
  expect(handed).toMatchObject({ status: "morning", amulet: { holder: "Dan", mustPass: false } });
  expect(werewolfAnnouncement(handed)).toEqual([]);
  expect(dawn(handed).status).toBe("day");
});

it("does not transfer retroactive protection to an already attacked player", () => {
  const night = nightTwo(deal("Eva"));
  const attacked = attack(night, "Dan");
  const morning = transfer(attacked, "Dan");
  expect(werewolfAnnouncement(morning)).toEqual([{ name: "Dan" }]);
  expect(dawn(morning)).toMatchObject({ status: "day", amulet: null });
});

it("preserves protection for the former holder after they pass it on", () => {
  const saved = attack(nightTwo(deal("Eva")), "Eva");
  const morning = transfer(saved, "Dan");
  expect(morning).toMatchObject({ victim: null, amulet: { holder: "Dan" } });
  expect(werewolfAnnouncement(morning)).toEqual([]);
  expect(dawn(morning).alive.map((p) => p.name)).toContain("Eva");
});

it("does not force a transfer for heartbreak and loses a kept amulet at death", () => {
  const bonded = apply(
    open(deal("Cam", ["cupid"])),
    { type: "bond", night: 1, players: ["Cam", "Eva"] },
    { type: "loversReady", night: 1 },
  );
  const day = resolve(firstNight(bonded));
  const night = dusk(day);
  const broken = attack(night, "Eva");
  expect(broken).toMatchObject({
    status: "amuletPass",
    amulet: { holder: "Cam", mustPass: false },
  });
  const kept = transfer(broken, "Cam");
  expect(kept.status).toBe("morning");
  expect(dawn(kept).amulet).toBeNull();
  const morning = transfer(broken, "Dan");
  expect(werewolfAnnouncement(morning).map((p) => p.name)).toEqual(["Eva", "Cam"]);
  expect(dawn(morning)).toMatchObject({ status: "day", amulet: { holder: "Dan" } });
  const voted = apply(day, ...lynchEvents(day, "Eva"), { type: "announceExile", night: 1 });
  expect(voted.amulet).toBeNull();
  expect(voted.alive.map((p) => p.name)).not.toContain("Cam");
});

it.each(["Cam", "Eva"])(
  "saves the original or redirected wolf victim with %s holding the amulet",
  (holder) => {
    const first = firstNight(
      apply(open(deal(holder, ["nightGuest"])), { type: "stayWith", night: 1, target: "Dan" }),
    );
    const second = apply(dusk(resolve(first)), { type: "stayWith", night: 2, target: "Eva" });
    const saved = attack(second, "Eva");
    expect(saved).toMatchObject({
      status: "amuletPass",
      victim: null,
      amulet: { holder, mustPass: true },
    });
    expect(werewolfAnnouncement(transfer(saved, holder === "Cam" ? "Dan" : "Flo"))).toEqual([]);
    expect(attack(second, "Cam").amulet?.mustPass).toBe(false);
  },
);

it("consumes a blocked poison and still forces the holder to pass", () => {
  const witch = firstNight(open(deal("Eva", ["witch"])));
  const saved = apply(witch, { type: "potions", night: 1, heal: false, poison: "Eva" });
  expect(saved).toMatchObject({
    status: "amuletPass",
    amulet: { mustPass: true },
    potions: { poison: false },
  });
  expect(werewolfAnnouncement(transfer(saved, "Flo"))).toEqual([]);
});

it("keeps spell protection but not heartbreak and transfers before the deaths", () => {
  const seats = [...names, "Gia", "Hugo", "Ira", "Jan", "Kim", "Lex"];
  const bonded = apply(
    open(deal("Eva", ["magician", "cupid"], {}, seats)),
    { type: "bond", night: 1, players: ["Eva", "Dan"] },
    { type: "loversReady", night: 1 },
    { type: "wolvesReady", night: 1 },
    { type: "inspect", night: 1, target: "Ada" },
    { type: "closeVision", night: 1 },
  );
  const saved = apply(bonded, { type: "castSpells", night: 1, heal: false, kill: ["Eva", "Dan"] });
  expect(saved).toMatchObject({
    status: "amuletPass",
    spellsRemaining: 0,
    spellVictims: [{ name: "Dan" }],
    amulet: { mustPass: true },
  });
  const morning = transfer(saved, "Bea");
  expect(werewolfAnnouncement(morning).map((p) => p.name)).toEqual(["Dan", "Eva"]);
  expect(dawn(morning)).toMatchObject({ status: "day", amulet: { holder: "Bea" } });
});

it.each([false, true])(
  "does not shield the former holder from a morning hunter shot (forced=%s)",
  (forced) => {
    const initial = deal("Eva", forced ? ["hunter", "witch"] : ["hunter"]);
    let first = firstNight(open(initial));
    if (forced) first = apply(first, { type: "potions", night: 1, heal: false, poison: null });
    let s = dusk(resolve(first));
    s = attack(s, forced ? "Eva" : "Cam");
    if (forced) s = apply(s, { type: "potions", night: 2, heal: false, poison: "Cam" });
    expect(s).toMatchObject({ status: "amuletPass", amulet: { mustPass: forced } });
    const hunter = dawn(transfer(s, "Flo"));
    expect(hunter.status).toBe("hunter");
    const shot = apply(hunter, { type: "shot", night: 2, target: "Eva" });
    expect(shot.status).toBe("day");
    expect(shot.alive.map((p) => p.name)).not.toContain("Eva");
    expect(shot.amulet?.holder).toBe("Flo");
  },
);

it("cannot shield the new holder from a hunter shot and removes the amulet", () => {
  const night = nightTwo(deal("Eva", ["hunter"]));
  const hunter = dawn(transfer(attack(night, "Cam"), "Dan"));
  const shot = apply(hunter, { type: "shot", night: 2, target: "Dan" });
  expect(shot).toMatchObject({ status: "day", amulet: null });
  expect(shot.alive.map((p) => p.name)).not.toContain("Dan");
  expect(werewolfAnnouncement(shot)).toEqual([{ name: "Dan" }]);
  expect(attack(dusk(shot), null).status).toBe("morning");
});

it("cannot block a correct hammer strike or the mayor penalty", () => {
  const first = firstNight(open(deal("Cam", ["mayor"], { mayor: "hammer" })));
  const hit = apply(attack(dusk(resolve(first, "Ada")), null), {
    type: "hammer",
    night: 2,
    target: "Ada",
  });
  expect(hit.status).toBe("amuletPass");
  const hitMorning = transfer(hit, "Eva");
  // (The werewolves had to attack somebody, too: besides the victim of the hammer another person is in the list.)
  expect(werewolfAnnouncement(hitMorning)).toContainEqual({ name: "Ada" });
  expect(dawn(hitMorning)).toMatchObject({
    status: "finished",
    winner: "village",
    amulet: { holder: "Eva" },
  });
  const miss = apply(attack(dusk(resolve(first)), null), {
    type: "hammer",
    night: 2,
    target: "Dan",
  });
  const missMorning = transfer(miss, "Eva");
  // (The werewolves had to attack somebody, too: besides the mayor who died of the wrong strike another person is in the list.)
  expect(werewolfAnnouncement(missMorning)).toContainEqual({ name: "Cam" });
  expect(dawn(missMorning).alive.map((p) => p.name)).toContain("Dan");
});

it("cannot heal an existing tough-guy wound when acquired after the attack", () => {
  const night = nightTwo(deal("Eva", ["toughGuy"]));
  const day = resolve(attack(night, "Cam"), "Cam");
  expect(day.toughGuyDiesOn).toBe(3);
  const morning = transfer(attack(dusk(day), null), "Cam");
  // (The werewolves had to attack somebody in the new night, too.)
  expect(werewolfAnnouncement(morning)).toContainEqual({ name: "Cam" });
  expect(dawn(morning).amulet).toBeNull();
});

it("executes a voted-out carrier and awards the tanner win", () => {
  {
    const day = resolve(firstNight(open(deal("Cam", ["tanner"], { tanner: "voteOnly" }))));
    const exile = apply(day, ...lynchEvents(day, "Cam"));
    expect(exile.status).toBe("exile");
    expect(werewolfAnnouncement(exile)).toEqual([{ name: "Cam" }]);
    const next = apply(exile, { type: "announceExile", night: 1 });
    expect(next.amulet).toBeNull();
    expect(next.alive.map((p) => p.name)).not.toContain("Cam");
    expect(next.tannerWinner).toBe("Cam");
    expect(next.history.find((e) => e.kind === "death" && e.player === "Cam")).toMatchObject({
      kind: "death",
      sources: [{ cause: "vote", actors: names.filter((name) => name !== "Cam") }],
    });
  }
});

it("delays a shot at the tough-guy carrier without activating amulet protection", () => {
  const night = nightTwo(deal("Dan", ["hunter", "toughGuy"], { toughGuy: "anyAttack" }));
  const hunter = dawn(transfer(attack(night, "Cam"), "Dan"));
  const wounded = apply(hunter, { type: "shot", night: 2, target: "Dan" });
  expect(wounded).toMatchObject({
    status: "day",
    toughGuyDiesOn: 3,
    amulet: { holder: "Dan", mustPass: false },
    toughGuyWound: { cause: "hunter", actors: ["Cam"] },
  });
  expect(wounded.alive.map((p) => p.name)).toContain("Dan");
  expect(werewolfAnnouncement(wounded)).toEqual([]);
  const end = attack(dusk(wounded), null);
  expect(pass(end, "Dan").status).toBe("morning");
  expect(resolve(end)).toMatchObject({ amulet: null });
});

it("shows the witch the attacked holder although the amulet stops the attack, and lets her heal", () => {
  // In the first night the witch does not use a potion.
  const first = apply(firstNight(open(deal("Eva", ["witch"]))), {
    type: "potions",
    night: 1,
    heal: false,
    poison: null,
  });
  const witch = attack(dusk(resolve(first)), "Eva");
  // The amulet stops the attack, but the witch sees the attacked person like in any other night.
  expect(witch).toMatchObject({ status: "witch", victim: null, wolfTarget: { name: "Eva" } });
  const healed = apply(witch, { type: "potions", night: 2, heal: true, poison: null });
  expect(healed).toMatchObject({
    status: "amuletPass",
    amulet: { holder: "Eva", mustPass: true },
    potions: { heal: false },
  });
});

it.each([
  ["a tough guy", null],
  ["a tough guy who is the drunk (not revealed yet)", { revealed: false }],
  ["a tough guy who is the drunk (revealed)", { revealed: true }],
] as const)(
  "lets the amulet take the attack of the werewolves before the tough guy rule: %s keeps his life and gets no wound",
  (_label, drunk) => {
    // The holder of the amulet is the tough guy (who is hurt only by the werewolves).
    const probe = deal("Eva", ["toughGuy"], { toughGuy: "wolfOnly" });
    const tough = probe.players.find((player) => player.role === "toughGuy")!.name;
    const dealt = deal(tough, ["toughGuy"], { toughGuy: "wolfOnly" });
    expect(dealt.amulet?.holder).toBe(tough);
    const start = drunk ? { ...dealt, drunk: { player: tough, ...drunk } } : dealt;
    const night = nightTwo(start);
    const attacked = attack(night, tough);
    // The amulet takes the attack: nobody is the victim, nobody is wounded, the holder has to pass the amulet on.
    expect(attacked).toMatchObject({ status: "amuletPass", victim: null });
    const morning = transfer(attacked, tough);
    expect(werewolfAnnouncement(morning)).toEqual([]);
    const day = dawn(morning);
    expect(day.alive.map((player) => player.name)).toContain(tough);
    expect(day.history.some((entry) => entry.kind === "injury")).toBe(false);
    expect(day.toughGuyDiesOn ?? null).toBeNull();
  },
);
