import { expect, it } from "vitest";
import {
  createWerewolf,
  transitionWerewolf,
  wakingPlayers,
  werewolfAnnouncement,
  werewolfDrunkReveal,
  type WerewolfEvent,
  type WerewolfSettings,
  type WerewolfSpecialRole,
  type WerewolfState,
} from "./stateMachine";

const names = Array.from({ length: 12 }, (_, index) => `P${index + 1}`);
const play = (state: WerewolfState, ...events: WerewolfEvent[]) =>
  events.reduce(transitionWerewolf, state);

function deal(extraRoles: WerewolfSpecialRole[] = [], settings: Partial<WerewolfSettings> = {}) {
  let draws = 0;
  const setup = createWerewolf(
    names.join(","),
    "Narrator",
    () => (++draws < names.length ? 0.99 : 4 / names.length),
    ["magician", ...extraRoles],
    settings,
  )!;
  return play(setup, ...names.map((player) => ({ type: "roleSeen", player }) as const));
}

const vision = (state: WerewolfState) =>
  play(
    state,
    { type: "inspect", night: state.night, target: "P1" },
    { type: "closeVision", night: state.night },
  );
const firstNight = (state = deal()) => vision(play(state, { type: "wolvesReady", night: 1 }));
const afterMorning = (state: WerewolfState) =>
  play(
    state,
    { type: "announceMorning", night: state.night },
    { type: "endDay", night: state.night },
  );
/** The werewolves have to attack: where a test used to attack nobody, the first living non-wolf is the victim. */
function firstVictim(state: WerewolfState): string {
  return state.alive.find((player) => player.role !== "wolf")!.name;
}

const attack = (state: WerewolfState, target: string | null) =>
  vision(play(state, { type: "attack", night: state.night, target: target ?? firstVictim(state) }));
const cast = (state: WerewolfState, heal = false, ...kill: string[]) =>
  play(state, { type: "castSpells", night: state.night, heal, kill });

it("allows the magician from eleven players and excludes the witch", () => {
  const seats = names.slice(0, 11);
  expect(createWerewolf(seats.slice(1).join(","), "Narrator", () => 0.99, ["magician"])).toBeNull();
  expect(createWerewolf(seats.join(","), "Narrator", () => 0.99, ["magician", "witch"])).toBeNull();
  const setup = createWerewolf(seats.join(","), "Narrator", () => 0.99, ["magician"]);
  expect(setup).not.toBeNull();
  if (!setup) throw new Error("Expected valid eleven-player magician setup");
  const state = firstNight(
    play(setup, ...seats.map((player) => ({ type: "roleSeen", player }) as const)),
  );
  expect(wakingPlayers(state)).toEqual(["P4"]);
  expect(state).toMatchObject({
    status: "magician",
    spellsRemaining: 2,
    victim: null,
    settings: { wolfCount: 2 },
  });
});

it("can spend both spells on distinct living targets including the magician", () => {
  const state = firstNight();
  expect(cast(state, true)).toBe(state);
  expect(cast(state, false, "P1", "P1")).toBe(state);
  expect(cast(state, false, "P1", "Nobody")).toBe(state);
  expect(cast(state, false, "P1", "P2", "P3")).toBe(state);
  const resolved = cast(state, false, "P5", "P1");
  expect(resolved.spellsRemaining).toBe(0);
  expect(werewolfAnnouncement(resolved)).toEqual([{ name: "P1" }, { name: "P5" }]);
});

it("can heal the magician and a different wolf victim over two nights", () => {
  const secondNight = afterMorning(cast(firstNight()));
  const danger = attack(secondNight, "P5");
  expect(danger).toMatchObject({ victim: { name: "P5" } });
  const healed = cast(danger, true);
  expect(werewolfAnnouncement(healed)).toEqual([]);
  const thirdNight = afterMorning(healed);
  const otherVictim = attack(thirdNight, "P6");
  expect(cast(otherVictim, true, "P1")).toBe(otherVictim);
  const secondHeal = cast(otherVictim, true);
  expect(werewolfAnnouncement(secondHeal)).toEqual([]);
  const spent = attack(afterMorning(secondHeal), "P7");
  expect(cast(spent, true)).toBe(spent);
  expect(cast(spent, false, "P1")).toBe(spent);
  expect(spent.status).toBe("nightCall");
  expect(play(spent, { type: "acknowledgeCall", night: spent.night }).status).toBe("morning");
});

it("can target the wolf victim and resolves the death only once", () => {
  const danger = attack(afterMorning(cast(firstNight())), "P6");
  for (const heal of [false, true]) {
    const resolved = cast(danger, heal, "P6");
    expect(werewolfAnnouncement(resolved)).toEqual([{ name: "P6" }]);
    expect(resolved.spellsRemaining).toBe(heal ? 0 : 1);
  }
});

it("can kill the tough guy immediately or heal only his fresh wolf attack", () => {
  const danger = attack(afterMorning(cast(firstNight(deal(["toughGuy"])))), "P6");
  expect(werewolfAnnouncement(cast(danger, false, "P6"))).toEqual([{ name: "P6" }]);
  const pending = cast(danger);
  expect(werewolfAnnouncement(pending)).toEqual([]);
  // The werewolves have to attack somebody else in the new night: the healing spell only saves this fresh attack, the old
  // wound of the tough guy still ends his life.
  const fresh = afterMorning(pending);
  const other = fresh.alive.find((p) => p.role !== "wolf" && p.name !== "P6")!.name;
  const late = attack(fresh, other);
  expect(werewolfAnnouncement(cast(late, true))).toEqual([{ name: "P6" }]);
  expect(werewolfAnnouncement(cast(late))).toEqual(
    expect.arrayContaining([{ name: "P6" }, { name: other }]),
  );
});

it("can heal the night guest and cast a death spell on the host", () => {
  const first = firstNight(
    play(deal(["nightGuest"]), {
      type: "stayWith",
      night: 1,
      target: "P7",
    }),
  );
  const wolves = play(afterMorning(cast(first)), { type: "stayWith", night: 2, target: "P8" });
  const danger = attack(wolves, "P8");
  expect(danger).toMatchObject({ victim: { name: "P6" } });
  const resolved = cast(danger, true, "P8");
  expect(werewolfAnnouncement(resolved)).toEqual([{ name: "P8" }]);
  expect(resolved.spellsRemaining).toBe(0);
});

it("wakes a masked magician only after the third-night reveal", () => {
  let first = firstNight(deal([], { drunk: true }));
  expect(first.status).toBe("nightCall");
  first = play(first, { type: "acknowledgeCall", night: 1 });
  let second = attack(afterMorning(first), null);
  expect(second.status).toBe("nightCall");
  second = play(second, { type: "acknowledgeCall", night: 2 });
  const reveal = afterMorning(second);
  expect(werewolfDrunkReveal(reveal)).toEqual({ name: "P5", role: "magician" });
  const third = attack(play(reveal, { type: "drunkReady", night: 3 }), null);
  expect(wakingPlayers(third)).toEqual(["P5"]);
  expect(third.spellsRemaining).toBe(2);
});
