import { expect, it } from "vitest";
import {
  createWerewolf,
  currentWerewolfRole,
  getWerewolfWinner,
  transitionWerewolf,
  wakingPlayers,
} from "./stateMachine";

const names = ["Ada", "Bea", "Cam", "Dan", "Eva", "Flo"];
function start(attackOnFirstNight?: boolean) {
  const settings = attackOnFirstNight === undefined ? {} : { attackOnFirstNight };
  const initial = createWerewolf(names.join(","), "Narrator", () => 0.99, [], settings)!;
  return names.reduce(
    (state, player) => transitionWerewolf(state, { type: "roleSeen", player }),
    initial,
  );
}

it("resolves the first wolf attack when the experimental setting is enabled", () => {
  let state = start(true);
  expect(wakingPlayers(state)).toEqual(["Ada"]);
  expect(transitionWerewolf(state, { type: "wolvesReady", night: 1 })).toBe(state);
  expect(transitionWerewolf(state, { type: "attack", night: 1, target: "Ada" })).toBe(state);
  state = transitionWerewolf(state, { type: "attack", night: 1, target: "Cam" });
  expect(state).toMatchObject({ status: "seer", victim: { name: "Cam" } });
  state = transitionWerewolf(state, { type: "inspect", night: 1, target: "Ada" });
  state = transitionWerewolf(state, { type: "closeVision", night: 1 });
  state = transitionWerewolf(state, { type: "announceMorning", night: 1 });
  expect(state.alive.map((player) => player.name)).toEqual(["Ada", "Bea", "Dan", "Eva", "Flo"]);
});

it("protects the first night and requires a strict majority", () => {
  let state = start();
  expect(transitionWerewolf(state, { type: "attack", night: 1, target: "Cam" })).toBe(state);
  state = transitionWerewolf(state, { type: "wolvesReady", night: 1 });
  state = transitionWerewolf(state, { type: "inspect", night: 1, target: "Ada" });
  expect(state).toMatchObject({ status: "vision", isWolf: true });
  state = transitionWerewolf(state, { type: "closeVision", night: 1 });
  state = transitionWerewolf(state, { type: "announceMorning", night: 1 });
  const nomination = {
    type: "nominate",
    night: 1,
    target: "Ada",
    nominator: "Bea",
    seconder: "Cam",
  } as const;
  state = transitionWerewolf(state, nomination);
  state = transitionWerewolf(state, { type: "vote", night: 1, nomination: 1, yes: 3 });
  expect(state.status).toBe("day");
  state = transitionWerewolf(state, nomination);
  state = transitionWerewolf(state, { type: "vote", night: 1, nomination: 2, yes: 4 });
  expect(transitionWerewolf(state, { type: "announceExile", night: 1 })).toMatchObject({
    winner: "village",
  });
});

it("counts the seer as a villager at parity and reveals a later victim only in the morning", () => {
  let state = start();
  expect(getWerewolfWinner(state.alive.slice(0, 2))).toBe("wolves");
  state = transitionWerewolf(state, { type: "wolvesReady", night: 1 });
  state = transitionWerewolf(state, { type: "inspect", night: 1, target: "Ada" });
  state = transitionWerewolf(state, { type: "closeVision", night: 1 });
  state = transitionWerewolf(state, { type: "announceMorning", night: 1 });
  state = transitionWerewolf(state, { type: "endDay", night: 1 });
  state = transitionWerewolf(state, { type: "attack", night: 2, target: "Bea" });
  expect(state.alive).toHaveLength(6);
  state = transitionWerewolf(state, { type: "inspect", night: 2, target: "Ada" });
  state = transitionWerewolf(state, { type: "closeVision", night: 2 });
  expect(transitionWerewolf(state, { type: "announceMorning", night: 2 }).alive).toHaveLength(5);
});

it("keeps parity separate from nomination validation and skips an eliminated seer", () => {
  expect(createWerewolf(names.join(","), "ada", () => 0.99)).toBeNull();
  expect(createWerewolf("Ada", "Narrator", () => 0.99)).toBeNull();
  let state = start();
  state = transitionWerewolf(state, { type: "wolvesReady", night: 1 });
  expect(transitionWerewolf(state, { type: "inspect", night: 1, target: "Bea" })).toBe(state);
  state = transitionWerewolf(state, { type: "inspect", night: 1, target: "Cam" });
  expect(state).toMatchObject({ status: "vision", isWolf: false });
  state = transitionWerewolf(state, { type: "closeVision", night: 1 });
  state = transitionWerewolf(state, { type: "announceMorning", night: 1 });
  expect(
    transitionWerewolf(state, {
      type: "nominate",
      night: 1,
      target: "Bea",
      nominator: "Cam",
      seconder: "Cam",
    }),
  ).toBe(state);
  state = transitionWerewolf(state, {
    type: "nominate",
    night: 1,
    target: "Bea",
    nominator: "Cam",
    seconder: "Dan",
  });
  expect(transitionWerewolf(state, { type: "vote", night: 1, nomination: 1, yes: 7 })).toBe(state);
  state = transitionWerewolf(state, { type: "vote", night: 1, nomination: 1, yes: 6 });
  state = transitionWerewolf(state, { type: "announceExile", night: 1 });
  expect(transitionWerewolf(state, { type: "attack", night: 2, target: "Ada" })).toBe(state);
  state = transitionWerewolf(state, { type: "attack", night: 2, target: null });
  expect(state).toMatchObject({ status: "morning", victim: null });
});

it("validates role and phase access and applies the larger group role counts", () => {
  const bigger = Array.from({ length: 15 }, (_, index) => "P" + index);
  const deal = (size: number) =>
    createWerewolf(bigger.slice(0, size).join(","), "Narrator", () => 0.99)!;
  expect(deal(9).players.filter((player) => player.role === "wolf")).toHaveLength(2);
  expect(deal(12).players.filter((player) => player.role === "wolf")).toHaveLength(3);
  expect(createWerewolf(names.join(","), "", () => 0.99)).toBeNull();
  const initial = deal(6);
  expect(currentWerewolfRole(initial)).toMatchObject({ name: "P0", role: "wolf" });
  expect(wakingPlayers(initial)).toEqual([]);
  expect(transitionWerewolf(initial, { type: "roleSeen", player: "P1" })).toBe(initial);
  let state = start();
  expect(currentWerewolfRole(state)).toBeNull();
  expect(wakingPlayers(state)).toEqual(["Ada"]);
  expect(transitionWerewolf(state, { type: "wolvesReady", night: 2 })).toBe(state);
  state = transitionWerewolf(state, { type: "wolvesReady", night: 1 });
  expect(wakingPlayers(state)).toEqual(["Bea"]);
  expect(transitionWerewolf(state, { type: "closeVision", night: 1 })).toBe(state);
});

it("supports the approved eight-player wolf choices and first allows the drunk at nine seats", () => {
  const seats = [...names, "Gia", "Hugo"].join(",");
  const deal = (wolfCount: number, drunk = false) =>
    createWerewolf(seats, "Narrator", () => 0.99, [], { wolfCount, drunk });
  expect(deal(1)?.players.filter((player) => player.role === "wolf")).toHaveLength(1);
  expect(deal(2)?.players.filter((player) => player.role === "wolf")).toHaveLength(2);
  expect(deal(2, true)).toBeNull();
  expect(createWerewolf(seats, "Narrator", () => 0.99)?.settings.wolfCount).toBe(2);
  expect(deal(1, true)).toBeNull();
  expect(deal(3)).toBeNull();
  expect(deal(1.5)).toBeNull();
  expect(createWerewolf(names.join(","), "Narrator", () => 0.99, [], { wolfCount: 2 })).toBeNull();
  const nineSeats = seats + ",Ira";
  const nine = createWerewolf(nineSeats, "Narrator", () => 0.99, [], { wolfCount: 2, drunk: true });
  expect(nine?.players.filter((player) => player.role === "wolf")).toHaveLength(2);
  expect(nine?.drunk).not.toBeNull();
  expect(createWerewolf(nineSeats, "Narrator", () => 0.99, [], { wolfCount: 1 })).toBeNull();
});

it("ignores out-of-phase commands and rejects nominations and ballots without valid participants", () => {
  let state = start();
  expect(transitionWerewolf(state, { type: "endDay", night: 1 })).toBe(state);
  state = transitionWerewolf(state, { type: "wolvesReady", night: 1 });
  state = transitionWerewolf(state, { type: "inspect", night: 1, target: "Cam" });
  expect(transitionWerewolf(state, { type: "announceMorning", night: 1 })).toBe(state);
  state = transitionWerewolf(state, { type: "closeVision", night: 1 });
  expect(transitionWerewolf(state, { type: "endDay", night: 1 })).toBe(state);
  state = transitionWerewolf(state, { type: "announceMorning", night: 1 });
  const nominate = {
    type: "nominate",
    night: 1,
    target: "Ada",
    nominator: "Bea",
    seconder: "Cam",
  } as const;
  expect(transitionWerewolf(state, { ...nominate, target: "Bea" })).toBe(state);
  expect(transitionWerewolf(state, { ...nominate, target: "Cam" })).toBe(state);
  expect(transitionWerewolf(state, { ...nominate, target: "Unknown" })).toBe(state);
  state = transitionWerewolf(state, nominate);
  expect(transitionWerewolf(state, { type: "vote", night: 1, nomination: 2, yes: 4 })).toBe(state);
  expect(transitionWerewolf(state, { type: "vote", night: 1, nomination: 1, yes: -1 })).toBe(state);
  expect(transitionWerewolf(state, { type: "vote", night: 1, nomination: 1, yes: 4.5 })).toBe(
    state,
  );
  state = transitionWerewolf(state, { type: "vote", night: 1, nomination: 1, yes: 4 });
  expect(transitionWerewolf(state, { type: "endDay", night: 1 })).toBe(state);
  state = transitionWerewolf(state, { type: "announceExile", night: 1 });
  expect(transitionWerewolf(state, { type: "endDay", night: 1 })).toBe(state);
});
