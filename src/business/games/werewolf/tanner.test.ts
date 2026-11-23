import { expect, it } from "vitest";
import {
  createWerewolf,
  transitionWerewolf,
  werewolfAnnouncement,
  type WerewolfEvent,
  type WerewolfSettings,
  type WerewolfSpecialRole,
  type WerewolfState,
} from "./stateMachine";
import { lynchEvents } from "./voteTesting";

const names = ["Ada", "Bea", "Cam", "Dan", "Eva", "Flo"];
const play = (state: WerewolfState, ...events: WerewolfEvent[]) =>
  events.reduce(transitionWerewolf, state);

function deal(settings: Partial<WerewolfSettings>, ...roles: WerewolfSpecialRole[]) {
  const setup = createWerewolf(
    names.join(","),
    "Narrator",
    () => 0.99,
    ["tanner", ...roles],
    settings,
  )!;
  return play(setup, ...names.map((player) => ({ type: "roleSeen", player }) as const));
}

function vision(state: WerewolfState) {
  return play(
    state,
    { type: "inspect", night: state.night, target: "Ada" },
    { type: "closeVision", night: state.night },
  );
}

const firstNight = (state: WerewolfState) => vision(play(state, { type: "wolvesReady", night: 1 }));
const dawn = (state: WerewolfState) => play(state, { type: "announceMorning", night: state.night });
const dusk = (state: WerewolfState) => play(state, { type: "endDay", night: state.night });
/** The werewolves have to attack: where a test used to attack nobody, the first living non-wolf is the victim. */
function firstVictim(state: WerewolfState): string {
  return state.alive.find((player) => player.role !== "wolf")!.name;
}

const attack = (state: WerewolfState, target: string | null) =>
  vision(play(state, { type: "attack", night: state.night, target: target ?? firstVictim(state) }));

function exile(state: WerewolfState, target: string) {
  return play(
    state,
    ...lynchEvents(state, target),
    { type: "announceExile", night: state.night },
    { type: "endDay", night: state.night },
  );
}

it.each(["anyDeath", "voteOnly"] as const)(
  "records a direct exile in mode %s and keeps playing",
  (tanner) => {
    const firstDay = dawn(firstNight(deal({ tanner })));
    expect(exile(firstDay, "Ada")).toMatchObject({
      status: "finished",
      winner: "village",
      tannerWinner: null,
    });
    const nextNight = exile(firstDay, "Cam");
    expect(nextNight).toMatchObject({ status: "wolves", night: 2, tannerWinner: "Cam" });
    const secondDay = dawn(attack(nextNight, null));
    expect(exile(secondDay, "Ada")).toMatchObject({
      status: "finished",
      winner: "village",
      tannerWinner: "Cam",
    });
  },
);

it("defaults to any death and distinguishes it from vote-only on a wolf attack", () => {
  expect(dawn(attack(dusk(dawn(firstNight(deal({})))), "Cam")).tannerWinner).toBe("Cam");
  expect(
    dawn(attack(dusk(dawn(firstNight(deal({ tanner: "voteOnly" })))), "Cam")).tannerWinner,
  ).toBeNull();
});

it.each(["anyDeath", "voteOnly"] as const)(
  "distinguishes a lover's exile from the tanner's own vote in mode %s",
  (tanner) => {
    const lovers = play(
      deal({ tanner }, "cupid"),
      { type: "bond", night: 1, players: ["Cam", "Eva"] },
      { type: "loversReady", night: 1 },
    );
    const day = dawn(firstNight(lovers));
    const indirect = exile(day, "Eva");
    expect(indirect.alive.map((player) => player.name)).toEqual(["Ada", "Bea", "Dan", "Flo"]);
    expect(indirect.tannerWinner).toBe(tanner === "anyDeath" ? "Cam" : null);
    expect(exile(day, "Cam").tannerWinner).toBe("Cam");
  },
);

it.each(["anyDeath", "voteOnly"] as const)(
  "records a hunter shot according to mode %s",
  (tanner) => {
    const day = dawn(firstNight(deal({ tanner }, "hunter")));
    const hunter = dawn(attack(dusk(day), "Dan"));
    expect(hunter.status).toBe("hunter");
    const aftermath = play(hunter, { type: "shot", night: 2, target: "Cam" });
    expect(aftermath).toMatchObject({
      status: "day",
      tannerWinner: tanner === "anyDeath" ? "Cam" : null,
    });
  },
);

it("uses the real goal for a masked tanner without changing the public announcement", () => {
  const seats = [...names, "Gia", "Hugo", "Ira"];
  let draws = 0;
  const setup = createWerewolf(
    seats.join(","),
    "Narrator",
    () => (++draws < seats.length ? 0.99 : 3 / seats.length),
    ["tanner"],
    { drunk: true },
  )!;
  const night = play(setup, ...seats.map((player) => ({ type: "roleSeen", player }) as const));
  const morning = attack(dusk(dawn(firstNight(night))), "Dan");
  expect(werewolfAnnouncement(morning)).toEqual([{ name: "Dan" }]);
  expect(dawn(morning)).toMatchObject({ status: "day", tannerWinner: "Dan" });
});
